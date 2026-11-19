import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { READ_PRIVATE_CHANNELS_PERMISSION_FLAG } from 'src/database/commands/upgrade-version-command/2-61/constants/read-private-channels-permission-flag.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1795080173241)
@Command({
  name: 'upgrade:2-61:backfill-read-private-channels-permission-flag',
  description:
    'Create the READ_PRIVATE_CHANNELS standard permission flag in workspaces that lack it',
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

    if (
      isDefined(
        flatPermissionFlagMaps.byUniversalIdentifier[
          READ_PRIVATE_CHANNELS_PERMISSION_FLAG.universalIdentifier
        ],
      )
    ) {
      return;
    }

    const isKeyTakenByAnotherApplication = Object.values(
      flatPermissionFlagMaps.byUniversalIdentifier,
    ).some(
      (permissionFlag) =>
        permissionFlag?.key === READ_PRIVATE_CHANNELS_PERMISSION_FLAG.key,
    );

    if (isKeyTakenByAnotherApplication) {
      this.logger.warn(
        `Workspace ${workspaceId}: another application already registered permission flag key ${READ_PRIVATE_CHANNELS_PERMISSION_FLAG.key}; skipping the standard flag`,
      );

      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating standard permission flag ${READ_PRIVATE_CHANNELS_PERMISSION_FLAG.key}`,
    );

    if (options.dryRun) {
      return;
    }

    const now = new Date().toISOString();

    const readPrivateChannelsPermissionFlag: FlatPermissionFlag = {
      id: v4(),
      ...READ_PRIVATE_CHANNELS_PERMISSION_FLAG,
      workspaceId,
      applicationId: twentyStandardFlatApplication.id,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      rolePermissionFlagIds: [],
      rolePermissionFlagUniversalIdentifiers: [],
      createdAt: now,
      updatedAt: now,
    };

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
              flatEntityToCreate: [readPrivateChannelsPermissionFlag],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to create the READ_PRIVATE_CHANNELS permission flag for workspace ${workspaceId}`,
      );
    }
  }
}
