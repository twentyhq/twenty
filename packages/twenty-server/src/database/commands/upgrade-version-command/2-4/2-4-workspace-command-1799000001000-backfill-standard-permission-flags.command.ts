import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.4.0', 1799000001000)
@Command({
  name: 'upgrade:2-4:backfill-standard-permission-flags',
  description:
    'Backfill standard permission flag definitions for existing workspaces created before flag definitions were syncable',
})
export class BackfillStandardPermissionFlagsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Checking standard permission flag definitions for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagMaps: existingMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardDefinitions = Object.values(
      standardAllFlatEntityMaps.flatPermissionFlagMaps
        .byUniversalIdentifier,
    ).filter(isDefined);

    const definitionsToCreate = standardDefinitions.filter(
      (definition) =>
        !isDefined(
          existingMaps.byUniversalIdentifier[definition.universalIdentifier],
        ),
    );

    if (definitionsToCreate.length === 0) {
      this.logger.log(
        `All standard permission flag definitions already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Found ${definitionsToCreate.length} missing standard permission flag definition(s) for workspace ${workspaceId}: ${definitionsToCreate.map((d) => d.key).join(', ')}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${definitionsToCreate.length} standard permission flag definition(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
              flatEntityToCreate: definitionsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill standard permission flag definitions:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill standard permission flag definitions for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created ${definitionsToCreate.length} standard permission flag definition(s) for workspace ${workspaceId}`,
    );
  }
}
