import { Command } from 'nest-commander';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';

export type ActorSourceEnumBackfillTarget = {
  objectNameSingular: string;
  fieldName: string;
  tableName: string;
  columnName: string;
  enumName: string;
  expectedValues: string[];
};

export const buildActorSourceEnumBackfillTargets = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ActorSourceEnumBackfillTarget[] => {
  const targets: ActorSourceEnumBackfillTarget[] = [];

  const actorFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatFieldMetadata) => flatFieldMetadata.type === FieldMetadataType.ACTOR,
    );

  for (const flatFieldMetadata of actorFlatFieldMetadatas) {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const compositeType = compositeTypeDefinitions.get(flatFieldMetadata.type);

    if (!isDefined(compositeType)) {
      continue;
    }

    const tableName = computeObjectTargetTable(flatObjectMetadata);

    for (const property of compositeType.properties) {
      if (!isEnumFieldMetadataType(property.type)) {
        continue;
      }

      const expectedValues =
        property.options?.map((option) => option.value) ?? [];

      if (expectedValues.length === 0) {
        continue;
      }

      const columnName = computeCompositeColumnName(
        flatFieldMetadata.name,
        property,
      );

      targets.push({
        objectNameSingular: flatObjectMetadata.nameSingular,
        fieldName: flatFieldMetadata.name,
        tableName,
        columnName,
        enumName: computePostgresEnumName({ tableName, columnName }),
        expectedValues,
      });
    }
  }

  return targets;
};

@RegisteredWorkspaceCommand('2.20.0', 1783499671542)
@Command({
  name: 'upgrade:2-20:backfill-actor-source-enum-values',
  description:
    'Backfill missing AGENT FieldActorSource values into the Postgres enums backing ACTOR fields (createdBy/updatedBy) of existing workspaces.',
})
export class BackfillActorSourceEnumValuesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const targets = buildActorSourceEnumBackfillTargets({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (targets.length === 0) {
      this.logger.log(
        `No ACTOR fields found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      await queryRunner.startTransaction();

      const companyCreatedBySourceTarget = targets.find(
        (target) =>
          target.objectNameSingular === 'company' &&
          target.columnName === 'createdBySource',
      );

      if (isDefined(companyCreatedBySourceTarget)) {
        const rows: { enumlabel: string }[] = await queryRunner.query(
          `SELECT e.enumlabel
           FROM pg_catalog.pg_type t
           JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
           JOIN pg_catalog.pg_enum e ON e.enumtypid = t.oid
           WHERE n.nspname = $1
             AND t.typname = $2`,
          [schemaName, companyCreatedBySourceTarget.enumName],
        );

        const existingValues = new Set(rows.map((row) => row.enumlabel));

        if (existingValues.has('AGENT')) {
          this.logger.log(
            `AGENT already present on ${schemaName}.${companyCreatedBySourceTarget.enumName}, skipping workspace ${workspaceId}`,
          );

          await queryRunner.commitTransaction();

          return;
        }
      }

      const isDryRun = options.dryRun ?? false;

      for (const target of targets) {
        await this.backfillEnumTarget({
          queryRunner,
          schemaName,
          target,
          workspaceId,
          isDryRun,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async backfillEnumTarget({
    queryRunner,
    schemaName,
    target,
    workspaceId,
    isDryRun,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    target: ActorSourceEnumBackfillTarget;
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would ensure [${target.expectedValues.join(', ')}] exist on ${schemaName}.${target.enumName} (workspace ${workspaceId})`,
      );

      return;
    }

    for (const value of target.expectedValues) {
      await this.workspaceSchemaManagerService.enumManager.upsertEnumValue({
        queryRunner,
        schemaName,
        enumName: target.enumName,
        value,
      });
    }

    this.logger.log(
      `Ensured actor source values on ${schemaName}.${target.enumName} (workspace ${workspaceId})`,
    );
  }
}
