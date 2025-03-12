import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Repository } from 'typeorm';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { isSameVersion } from 'src/utils/version/is-same-version';

export abstract class UpgradeCommandRunner extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  abstract readonly fromVersion: SemVer;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly environmentService: EnvironmentService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, environmentService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceId, index, total, options, appVersion } = args;

    this.logger.log(
      chalk.blue(
        `${options.dryRun ? '(dry run)' : ''} Upgrading workspace ${workspaceId} ${index + 1}/${total}`,
      ),
    );

    await this.validateWorkspaceVersionEqualFromVersionOrThrow({
      appVersion,
      workspaceId,
    });

    await this.beforeSyncMetadataUpgradeCommandsToRun(args);
    await this.syncWorkspaceMetadataCommand.runOnWorkspace(args);
    await this.afterSyncMetadataUpgradeCommandsToRun(args);

    await this.workspaceRepository.update(
      { id: workspaceId },
      { version: appVersion },
    );
    this.logger.log(
      chalk.blue(`Upgrade for workspace ${workspaceId} completed.`),
    );
  }

  private async validateWorkspaceVersionEqualFromVersionOrThrow({
    appVersion,
    workspaceId,
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'appVersion'>) {
    if (!isDefined(appVersion)) {
      throw new Error(
        'Cannot run upgrade command when APP_VERSION is not defined',
      );
    }

    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED to=${appVersion}`);
    }

    if (!isSameVersion(currentWorkspaceVersion, this.fromVersion.version)) {
      throw new Error(
        `WORKSPACE_VERSION_MISSMATCH workspaceVersion=${currentWorkspaceVersion} from=${this.fromVersion.version} to=${appVersion}`,
      );
    }
  }

  protected abstract beforeSyncMetadataUpgradeCommandsToRun(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
  protected abstract afterSyncMetadataUpgradeCommandsToRun(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
}
