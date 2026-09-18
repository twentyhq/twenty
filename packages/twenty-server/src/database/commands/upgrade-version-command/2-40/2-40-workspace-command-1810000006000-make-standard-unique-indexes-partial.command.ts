import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
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
// NEW name: the non-partial index is dropped, the partial one is created under the
// new name, and the indexMetadata row is re-pointed (name, indexWhereClause,
// deterministic universal identifier) so future standard-application syncs match.

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
  flatIndexMetadata: FlatIndexMetadata;
  flatObjectMetadata: FlatObjectMetadata;
};

@RegisteredWorkspaceCommand('2.40.0', 1810000006000)
@Command({
  name: 'upgrade:2-40:make-standard-unique-indexes-partial',
  description:
    'Make the stock company.domainName and person.emails unique indexes partial (WHERE "deletedAt" IS NULL) so soft-deleted rows stop reserving their values: drop the non-partial index, create the partial one under its new deterministic name (the name hashes the WHERE clause), and re-point the indexMetadata row at it. Idempotent: fresh workspaces already carry the partial index and are skipped, and reruns converge on the already-updated metadata.',
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

      for (const operation of operations) {
        // Drop the non-partial index first (IF EXISTS: no-op on reruns and on
        // fresh workspaces, which never had it). The partial constraint is
        // strictly weaker, so no new violation can surface in the gap.
        await dropIndexFromWorkspaceSchema({
          indexName: operation.oldIndexName,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
          queryRunner,
          schemaName,
        });

        // Create the partial index under its new deterministic name
        // (IF NOT EXISTS + CONCURRENTLY: writes are not blocked, and the physical
        // columns come from the existing indexMetadata row's flat index fields —
        // company domainNamePrimaryLinkUrl, person emailsPrimaryEmail).
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

        // Re-point the indexMetadata row (matched by object + old index name) at
        // the new index so future standard-application syncs match by name and
        // deterministic universal identifier.
        await this.indexMetadataRepository.update(
          { id: operation.indexMetadataId, workspaceId },
          {
            name: operation.newIndexName,
            indexWhereClause: PARTIAL_DELETED_AT_WHERE_CLAUSE,
            universalIdentifier: operation.newIndexUniversalIdentifier,
          },
        );

        this.logger.log(
          `Made ${operation.objectNameSingular} unique index ${operation.oldIndexName} -> ${operation.newIndexName} partial (workspace ${workspaceId})`,
        );
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
    flatIndexMaps: MetadataFlatEntityMaps<'indexMetadata'>;
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

    const currentFlatIndex = objectIndexes.find(
      (flatIndex) => flatIndex.name === oldIndexName,
    );

    if (!isDefined(currentFlatIndex)) {
      if (objectIndexes.some((flatIndex) => flatIndex.name === newIndexName)) {
        this.logger.log(
          `The ${spec.objectName} unique index is already partial (${newIndexName}), skipping (workspace ${workspaceId})`,
        );
      } else {
        this.logger.warn(
          `No indexMetadata row for the ${spec.objectName} unique index (${oldIndexName} or ${newIndexName}), skipping (workspace ${workspaceId})`,
        );
      }

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
      flatIndexMetadata: currentFlatIndex,
      flatObjectMetadata,
    };
  }
}
