import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-7207-46e8-9dab-849505ae8497';

// Second half of the timelineActivity.name replacement. 2.33 stopped writing the
// column and backfilled timelineActivityTypeId from it; dropping it had to wait a
// release so a rolling deploy never has pods still inserting a column that is
// already gone.
@RegisteredWorkspaceCommand('2.34.0', 1787500000000)
@Command({
  name: 'upgrade:2-34:drop-timeline-activity-name-field',
  description:
    'Drop the leftover timelineActivity.name field metadata and its workspace column',
})
export class DropTimelineActivityNameFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const legacyNameField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(legacyNameField)) {
      this.logger.log(
        `timelineActivity.name already dropped for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would drop timelineActivity.name for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [legacyNameField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to drop timelineActivity.name for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Dropped timelineActivity.name for workspace ${workspaceId}`,
    );
  }
}
