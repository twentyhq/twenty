import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { isSameMajorAndMinorVersion } from 'src/utils/version/is-same-major-and-minorversion';

type ValidateWorkspaceVersionEqualsWorkspaceFromVersionOrThrowArgs = {
  workspaceId: string
  appVersion: string | undefined
}

export abstract class UpgradeCommandRunner extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  abstract readonly fromWorkspaceVersion: SemVer;
  public readonly VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG?: true;
  
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly environmentService: EnvironmentService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceId, index, total, options } = args;
    const appVersion = this.environmentService.get('APP_VERSION');

    this.logger.log(
      chalk.blue(
        `${options.dryRun ? '(dry run)' : ''} Upgrading workspace ${workspaceId} ${index + 1}/${total}`,
      ),
    );

    await this.validateWorkspaceVersionEqualsWorkspaceFromVersionOrThrow({
      appVersion,
      workspaceId,
    });

    await this.runBeforeSyncMetadata(args);
    await this.syncWorkspaceMetadataCommand.runOnWorkspace(args);
    await this.runAfterSyncMetadata(args);

    await this.workspaceRepository.update(
      { id: workspaceId },
      { version: appVersion },
    );
    this.logger.log(
      chalk.blue(`Upgrade for workspace ${workspaceId} completed.`),
    );
  }

  private async validateWorkspaceVersionEqualsWorkspaceFromVersionOrThrow({
    appVersion,
    workspaceId,
  }: ValidateWorkspaceVersionEqualsWorkspaceFromVersionOrThrowArgs) {
    if (!isDefined(appVersion)) {
      throw new Error(
        'Cannot run upgrade command when APP_VERSION is not defined',
      );
    }

    if (!isDefined(this.VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG)) {
      this.logger.warn("VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG set to true ignoring workspace versions validation step")
      return
    }

    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED to=${appVersion}`);
    }

    if (!isSameMajorAndMinorVersion(currentWorkspaceVersion, this.fromWorkspaceVersion.version)) {
      throw new Error(
        `WORKSPACE_VERSION_MISSMATCH workspaceVersion=${currentWorkspaceVersion} fromWorkspaceVersion=${this.fromWorkspaceVersion.version} to=${appVersion}`,
      );
    }
  }

  protected abstract runBeforeSyncMetadata(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
  protected abstract runAfterSyncMetadata(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
}
