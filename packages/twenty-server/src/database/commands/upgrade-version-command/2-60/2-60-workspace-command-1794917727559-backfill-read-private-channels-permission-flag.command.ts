import { Command } from 'nest-commander';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeMissingStandardPermissionFlags } from 'src/database/commands/upgrade-version-command/2-60/utils/compute-missing-standard-permission-flags.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildStandardFlatPermissionFlagMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag/build-standard-flat-permission-flag-metadata-maps.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.60.0', 1794917727559)
@Command({
  name: 'upgrade:2-60:backfill-read-private-channels-permission-flag',
  description:
    'Create the standard permission flags an existing workspace lacks, such as READ_PRIVATE_CHANNELS, added in 2.60',
})
export class BackfillReadPrivateChannelsPermissionFlagCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);

    const { permissionFlagsToCreate, permissionFlagsSkippedForKeyClash } =
      computeMissingStandardPermissionFlags({
        standardFlatPermissionFlagMaps:
          buildStandardFlatPermissionFlagMetadataMaps({
            now: new Date().toISOString(),
            workspaceId,
            twentyStandardApplicationId: twentyStandardFlatApplication.id,
          }),
        existingFlatPermissionFlagMaps: flatPermissionFlagMaps,
      });

    if (isNonEmptyArray(permissionFlagsSkippedForKeyClash)) {
      this.logger.warn(
        `Workspace ${workspaceId}: another application already registered permission flag key(s) ${permissionFlagsSkippedForKeyClash.map((permissionFlag) => permissionFlag.key).join(', ')}; skipping the standard flag(s)`,
      );
    }

    if (!isNonEmptyArray(permissionFlagsToCreate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating standard permission flag(s) ${permissionFlagsToCreate.map((permissionFlag) => permissionFlag.key).join(', ')}`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
              flatEntityToCreate: permissionFlagsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to backfill the standard permission flags for workspace ${workspaceId}`,
      );
    }
  }
}
