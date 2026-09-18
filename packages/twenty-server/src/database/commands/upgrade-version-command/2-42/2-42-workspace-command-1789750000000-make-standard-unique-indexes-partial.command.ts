import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { doesPhysicalIndexExist } from 'src/database/commands/upgrade-version-command/2-18/utils/does-physical-index-exist.util';
import { isPhysicalIndexValid } from 'src/database/commands/upgrade-version-command/2-42/utils/is-physical-index-valid.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import {
  createIndexInWorkspaceSchema,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

// The stock demo companies/people are soft-deleted in the UI, and the non-partial
// unique indexes kept reserving their domainName / primaryEmail values: creating a
// company (or person) whose value matched a soft-deleted row 400'd on the unique
// constraint (verified in production for company: IDX_UNIQUE_2a32339058d0b6910b0834ddf81,
// confirmable in pg_indexes). This makes both indexes partial (WHERE "deletedAt" IS
// NULL), the idiom already used by the target and message tables.
//
// The deterministic index name hashes the WHERE clause, so the partial index gets a
// NEW name. The partial index is created under the new name FIRST (it coexists with
// the old one) and only then is the old one dropped: dropping first would open a
// window where no unique constraint covers live rows, and two duplicate live values
// inserted in that window make CREATE UNIQUE INDEX CONCURRENTLY fail. Such a failure
// leaves an INVALID physical index (pg_index.indisvalid = false) that silently
// satisfies IF NOT EXISTS on reruns, so the new index's physical validity is
// checked up front and an invalid remnant is dropped and rebuilt. The indexMetadata
// row is re-pointed (name, indexWhereClause, deterministic universal identifier)
// last: the physical catalog decides, the metadata is only a pointer, and every
// rerun converges.

const PARTIAL_DELETED_AT_WHERE_CLAUSE = '"deletedAt" IS NULL';

type PartialUniqueIndexSpec =
  | { objectName: 'company'; fieldName: 'domainName' }
  | { objectName: 'person'; fieldName: 'emails' };

const PARTIAL_UNIQUE_INDEX_SPECS: PartialUniqueIndexSpec[] = [
  { objectName: 'company', fieldName: 'domainName' },
  { objectName: 'person', fieldName: 'emails' },
];

type PartialUniqueIndexOperation = {
  objectNameSingular: string;
  oldIndexName: string;
  newIndexName: string;
  newIndexUniversalIdentifier: string;
  indexMetadataId: string;
  metadataName: string;
  flatIndexMetadata: FlatIndexMetadata;
  flatObjectMetadata: FlatObjectMetadata;
};

type PartialUniqueIndexPlan = {
  operation: PartialUniqueIndexOperation;
  // null from the catalog = absent, false = invalid remnant of a failed
  // CONCURRENTLY create, true = enforcing
  isNewIndexValid: boolean;
  isNewIndexInvalid: boolean;
  oldIndexExists: boolean;
};

@RegisteredWorkspaceCommand('2.42.0', 1789750000000)
@Command({
  name: 'upgrade:2-42:make-standard-unique-indexes-partial',
  description:
    'Make the stock company.domainName and person.emails unique indexes partial (WHERE "deletedAt" IS NULL) so soft-deleted rows stop reserving their values: create the partial index under its new deterministic name (the name hashes the WHERE clause) while the non-partial one still enforces, then drop the non-partial one, and re-point the indexMetadata row at it. Idempotent: an invalid index left by a failed concurrent create is dropped and rebuilt, and workspaces that already carry a valid partial index are skipped based on the physical catalog.',
})
export class MakeStandardUniqueIndexesPartialCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const operations = PARTIAL_UNIQUE_INDEX_SPECS.flatMap((spec) => {
      const operation = this.computePartialIndexOperation({
        spec,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        workspaceId,
      });

      return isDefined(operation) ? [operation] : [];
    });

    if (operations.length === 0) {
      this.logger.log(
        `No standard unique index to make partial for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Making ${operations.length} standard unique index(es) partial for workspace ${workspaceId}: ${operations.map(({ oldIndexName, newIndexName }) => `${oldIndexName} -> ${newIndexName}`).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const plans = await Promise.all(
        operations.map((operation) =>
          this.computePartialIndexPlan({ operation, queryRunner, schemaName }),
        ),
      );
      const pendingPlans = plans.filter((plan) =>
        this.hasPendingPartialIndexActions(plan),
      );

      if (pendingPlans.length === 0) {
        this.logger.log(
          `Standard unique indexes already partial for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      for (const plan of pendingPlans) {
        await this.applyPartialIndexPlan({
          plan,
          flatFieldMetadataMaps,
          queryRunner,
          schemaName,
          workspaceId,
        });
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const indexRelatedFlatMapsKeys = [
      ...new Set(
        ['index' as const, ...getMetadataRelatedMetadataNames('index')].map(
          getMetadataFlatEntityMapsKey,
        ),
      ),
    ];

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      indexRelatedFlatMapsKeys,
    );
  }

  // A failed CREATE UNIQUE INDEX CONCURRENTLY leaves an index that exists but is
  // not valid (relkind 'I', indisvalid = false): it satisfies IF NOT EXISTS on
  // the next create without enforcing anything, so validity — not existence —
  // decides whether the new index must (re)be built.
  private async computePartialIndexPlan({
    operation,
    queryRunner,
    schemaName,
  }: {
    operation: PartialUniqueIndexOperation;
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<PartialUniqueIndexPlan> {
    const newIndexValidity = await isPhysicalIndexValid({
      queryRunner,
      schemaName,
      indexName: operation.newIndexName,
    });
    const oldIndexExists = await doesPhysicalIndexExist({
      queryRunner,
      schemaName,
      indexName: operation.oldIndexName,
    });

    return {
      operation,
      isNewIndexValid: newIndexValidity === true,
      isNewIndexInvalid: newIndexValidity === false,
      oldIndexExists,
    };
  }

  private hasPendingPartialIndexActions(plan: PartialUniqueIndexPlan): boolean {
    const { operation } = plan;

    return (
      !plan.isNewIndexValid ||
      plan.oldIndexExists ||
      operation.metadataName !== operation.newIndexName
    );
  }

  private async applyPartialIndexPlan({
    plan,
    flatFieldMetadataMaps,
    queryRunner,
    schemaName,
    workspaceId,
  }: {
    plan: PartialUniqueIndexPlan;
    flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
    queryRunner: QueryRunner;
    schemaName: string;
    workspaceId: string;
  }): Promise<void> {
    const { operation } = plan;

    // Invalid remnant of a previously failed concurrent create: drop it first so
    // the rebuild below is not swallowed by IF NOT EXISTS.
    if (plan.isNewIndexInvalid) {
      await dropIndexFromWorkspaceSchema({
        indexName: operation.newIndexName,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        queryRunner,
        schemaName,
      });

      this.logger.log(
        `Dropped invalid ${operation.objectNameSingular} index ${operation.newIndexName} left by a failed concurrent creation (workspace ${workspaceId})`,
      );
    }

    if (!plan.isNewIndexValid) {
      // Create the partial index BEFORE dropping the non-partial one: the new
      // index enforces uniqueness on live rows the moment it is built, so there
      // is no window where duplicate live values can slip through. IF NOT
      // EXISTS + CONCURRENTLY: no-op on reruns, and writes are not blocked. The
      // physical columns come from the existing indexMetadata row's flat index
      // fields — company domainNamePrimaryLinkUrl, person emailsPrimaryEmail.
      await createIndexInWorkspaceSchema({
        flatIndexMetadata: {
          ...operation.flatIndexMetadata,
          name: operation.newIndexName,
          indexWhereClause: PARTIAL_DELETED_AT_WHERE_CLAUSE,
        },
        flatObjectMetadata: operation.flatObjectMetadata,
        flatFieldMetadataMaps,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        queryRunner,
        workspaceId,
        concurrently: true,
      });
    }

    if (plan.oldIndexExists) {
      await dropIndexFromWorkspaceSchema({
        indexName: operation.oldIndexName,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        queryRunner,
        schemaName,
      });
    }

    // Re-point the indexMetadata row last (matched by object + current name) so
    // future standard-application syncs match by name and deterministic universal
    // identifier, and a crash before this line just means the next rerun repeats
    // the physical steps (all IF EXISTS / IF NOT EXISTS) without losing the
    // pointer.
    if (operation.metadataName !== operation.newIndexName) {
      await this.indexMetadataRepository.update(
        { id: operation.indexMetadataId, workspaceId },
        {
          name: operation.newIndexName,
          indexWhereClause: PARTIAL_DELETED_AT_WHERE_CLAUSE,
          universalIdentifier: operation.newIndexUniversalIdentifier,
        },
      );
    }

    this.logger.log(
      `Made ${operation.objectNameSingular} unique index ${operation.oldIndexName} -> ${operation.newIndexName} partial (workspace ${workspaceId})`,
    );
  }

  private computePartialIndexOperation({
    spec,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    workspaceId,
  }: {
    spec: PartialUniqueIndexSpec;
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
    flatIndexMaps: MetadataFlatEntityMaps<'index'>;
    workspaceId: string;
  }): PartialUniqueIndexOperation | undefined {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[spec.objectName].universalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      this.logger.warn(
        `Could not find the ${spec.objectName} standard object metadata, skipping (workspace ${workspaceId})`,
      );

      return undefined;
    }

    const objectFields = STANDARD_OBJECTS[spec.objectName].fields;
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        objectFields[spec.fieldName as keyof typeof objectFields]
          .universalIdentifier
      ];

    if (!isDefined(flatFieldMetadata)) {
      this.logger.warn(
        `Could not find the ${spec.objectName}.${spec.fieldName} standard field metadata, skipping (workspace ${workspaceId})`,
      );

      return undefined;
    }

    // Same derivation the standard-application builder and the engine use — the
    // deterministic name hashes table name + ordered column names + WHERE clause,
    // so the partial variant (below) necessarily differs from the legacy one.
    const objectFlatFieldMetadatas: FlatFieldMetadata[] = [flatFieldMetadata];
    const indexFields = [
      {
        order: 0,
        fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        subFieldName: null,
      },
    ];

    const oldIndexName = computeFlatIndexNameOrThrow({
      flatObjectMetadata,
      objectFlatFieldMetadatas,
      indexFields,
      isUnique: true,
      indexWhereClause: null,
    });

    const newIndexName = computeFlatIndexNameOrThrow({
      flatObjectMetadata,
      objectFlatFieldMetadatas,
      indexFields,
      isUnique: true,
      indexWhereClause: PARTIAL_DELETED_AT_WHERE_CLAUSE,
    });

    const flatIndexes = Object.values(flatIndexMaps.byUniversalIdentifier).filter(
      isDefined,
    );
    const objectIndexes = flatIndexes.filter(
      (flatIndex) =>
        flatIndex.objectMetadataUniversalIdentifier ===
        flatObjectMetadata.universalIdentifier,
    );

    // Metadata is a pointer, not the state: a row already pointing at the new
    // name can still need repair if the physical index is missing or invalid,
    // so the physical catalog (computePartialIndexPlan) makes the final call.
    const currentFlatIndex =
      objectIndexes.find((flatIndex) => flatIndex.name === oldIndexName) ??
      objectIndexes.find((flatIndex) => flatIndex.name === newIndexName);

    if (!isDefined(currentFlatIndex)) {
      this.logger.warn(
        `No indexMetadata row for the ${spec.objectName} unique index (${oldIndexName} or ${newIndexName}), skipping (workspace ${workspaceId})`,
      );

      return undefined;
    }

    return {
      objectNameSingular: flatObjectMetadata.nameSingular,
      oldIndexName,
      newIndexName,
      newIndexUniversalIdentifier: getIndexUniversalIdentifier({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        name: newIndexName,
      }),
      indexMetadataId: currentFlatIndex.id,
      metadataName: currentFlatIndex.name,
      flatIndexMetadata: currentFlatIndex,
      flatObjectMetadata,
    };
  }
}
