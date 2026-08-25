import { Command } from 'nest-commander';
import { fromArrayToValuesByKeyRecord } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTimelineActivityTargetFieldRepairs } from 'src/database/commands/upgrade-version-command/2-35/utils/build-timeline-activity-target-field-repairs.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
      },
    );

    if (skippedRepairs.length > 0) {
      this.logger.warn(
        `Skipped ${skippedRepairs.length} unrepairable timeline activity target field(s) for workspace ${workspaceId}: ${skippedRepairs.join(', ')}`,
      );
    }

    if (repairs.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would repair ${repairs.length} timeline activity target field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const repairsByApplicationUniversalIdentifier =
      fromArrayToValuesByKeyRecord({
        array: repairs.map((repair) => ({
          ...repair,
          applicationUniversalIdentifier:
            repair.flatFieldMetadataToUpdate.applicationUniversalIdentifier,
        })),
        key: 'applicationUniversalIdentifier',
      });

    for (const [
      applicationUniversalIdentifier,
      applicationRepairs,
    ] of Object.entries(repairsByApplicationUniversalIdentifier)) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: applicationRepairs.map(
                  ({ flatFieldMetadataToUpdate }) => flatFieldMetadataToUpdate,
                ),
              },
              index: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: applicationRepairs.flatMap(
                  ({ flatIndexMetadatasToUpdate }) =>
                    flatIndexMetadatasToUpdate,
                ),
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
  }
}
