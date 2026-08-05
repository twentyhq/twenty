import { Command } from 'nest-commander';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type ActorApplicationUniversalIdentifierColumnTarget = {
  tableName: string;
  columnNames: string[];
};

export const buildActorApplicationUniversalIdentifierColumnTargets = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ActorApplicationUniversalIdentifierColumnTarget[] => {
  const actorCompositeType = compositeTypeDefinitions.get(
    FieldMetadataType.ACTOR,
  );
  const applicationUniversalIdentifierProperty =
    actorCompositeType?.properties.find(
      (property) => property.name === 'applicationUniversalIdentifier',
    );

  if (!isDefined(applicationUniversalIdentifierProperty)) {
    throw new Error(
      'applicationUniversalIdentifier is not defined on the ACTOR composite type',
    );
  }

  const columnNamesByTableName = new Map<string, string[]>();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (flatFieldMetadata.type !== FieldMetadataType.ACTOR) {
      continue;
    }

    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
      continue;
    }

    const tableName = computeObjectTargetTable(flatObjectMetadata);
    const columnName = computeCompositeColumnName(
      flatFieldMetadata.name,
      applicationUniversalIdentifierProperty,
    );
    const existingColumnNames = columnNamesByTableName.get(tableName) ?? [];

    columnNamesByTableName.set(tableName, [
      ...existingColumnNames,
      columnName,
    ]);
  }

  return [...columnNamesByTableName.entries()].map(
    ([tableName, columnNames]) => ({ tableName, columnNames }),
  );
};

export const buildAddActorApplicationUniversalIdentifierColumnsSql = ({
  schemaName,
  target,
}: {
  schemaName: string;
  target: ActorApplicationUniversalIdentifierColumnTarget;
}): string =>
  `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(target.tableName)} ${target.columnNames
    .map(
      (columnName) =>
        `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(columnName)} uuid`,
    )
    .join(', ')}`;

@RegisteredWorkspaceCommand('2.28.0', 1785915867000)
@Command({
  name: 'upgrade:2-28:add-application-universal-identifier-to-actor',
  description:
    'Add the nullable applicationUniversalIdentifier column to ACTOR fields in existing workspaces',
})
export class AddApplicationUniversalIdentifierToActorCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    const targets = buildActorApplicationUniversalIdentifierColumnTargets({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (targets.length === 0) {
      this.logger.log(
        `No local ACTOR fields found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      const columnCount = targets.reduce(
        (count, target) => count + target.columnNames.length,
        0,
      );

      this.logger.log(
        `[DRY RUN] Would add ${columnCount} nullable ACTOR application identity columns across ${targets.length} tables for workspace ${workspaceId}`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      for (const target of targets) {
        await queryRunner.query(
          buildAddActorApplicationUniversalIdentifierColumnsSql({
            schemaName,
            target,
          }),
        );
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

    this.logger.log(
      `Added nullable ACTOR application identity columns across ${targets.length} tables for workspace ${workspaceId}`,
    );
  }
}
