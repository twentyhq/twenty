import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTimelineActivityTargetFieldRepairs } from 'src/database/commands/upgrade-version-command/2-35/utils/build-timeline-activity-target-field-repairs.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.35.0', 1787641226000)
@Command({
  name: 'upgrade:2-35:repair-timeline-activity-target-field-names',
  description:
    'Repair timeline activity target morph field names left stale by object renames',
})
export class RepairTimelineActivityTargetFieldNamesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const timelineActivityFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      });

    if (!isDefined(timelineActivityFlatObjectMetadata)) {
      return;
    }

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot verify timeline activity target columns for workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
      );

      return;
    }

    const existingColumnNames = await this.readExistingColumnNames({
      dataSource,
      workspaceId,
      timelineActivityFlatObjectMetadata,
    });

    const {
      flatFieldMetadatasToUpdate,
      flatIndexMetadatasToUpdate,
      unrepairableTargetFields,
    } = buildTimelineActivityTargetFieldRepairs({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      existingColumnNames,
    });

    if (unrepairableTargetFields.length > 0) {
      // Left as an error rather than a throw: a thrown workspace step aborts the
      // whole instance upgrade sequence, and this drift predates the command.
      this.logger.error(
        [
          `MANUAL REPAIR REQUIRED: ${unrepairableTargetFields.length} timeline activity target field(s) in workspace ${workspaceId} cannot be repaired automatically.`,
          ...unrepairableTargetFields.map(
            ({ fieldName, expectedName, reason }) =>
              `  - ${fieldName} -> ${expectedName}: ${reason}`,
          ),
        ].join('\n'),
      );
    }

    if (flatFieldMetadatasToUpdate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would repair ${flatFieldMetadatasToUpdate.length} timeline activity target field(s) and ${flatIndexMetadatasToUpdate.length} index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            timelineActivityFlatObjectMetadata.applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldMetadatasToUpdate,
            },
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatIndexMetadatasToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to repair timeline activity target fields for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }

  private async readExistingColumnNames({
    dataSource,
    workspaceId,
    timelineActivityFlatObjectMetadata,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    timelineActivityFlatObjectMetadata: Parameters<
      typeof getWorkspaceSchemaContextForMigration
    >[0]['objectMetadata'];
  }): Promise<Set<string>> {
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: timelineActivityFlatObjectMetadata,
    });

    const rows = await dataSource.query<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
      [schemaName, tableName],
    );

    return new Set(rows.map(({ column_name }) => column_name));
  }
}
