import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { SingleVersionUpgradeCommand } from 'src/database/commands/upgrade-version-command/single-version-upgrade.command';
import {
  discoverVersionPaths,
  VersionPath,
} from 'src/database/commands/upgrade-version-command/version-utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { compareVersionMajorAndMinor } from 'src/utils/version/compare-version-minor-and-major';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

/**
 * Main upgrade command that supports upgrading workspaces across multiple versions
 * in the correct sequence by selecting the appropriate migration commands.
 */
@Command({
  name: 'upgrade',
  description:
    'Upgrade workspaces across multiple versions sequentially to the latest version',
})
export class UpgradeCommand
  extends ActiveOrSuspendedWorkspacesMigrationCommandRunner
  implements OnModuleInit
{
  private readonly minimumSupportedVersion = new SemVer('0.43.0');

  private versionPaths: VersionPath[] = [];

  // Getter for testing purposes
  public get versionPathsForTesting(): VersionPath[] {
    return this.versionPaths;
  }

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    protected readonly singleVersionUpgradeCommand: SingleVersionUpgradeCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  onModuleInit() {
    this.versionPaths = discoverVersionPaths();

    this.logger.log(
      `Discovered ${this.versionPaths.length} version upgrade paths: ` +
        this.versionPaths
          .map((path) => `${path.baseVersion} → ${path.targetVersion}`)
          .join(', '),
    );
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceId } = args;

    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });

    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED workspace=${workspaceId}`);
    }

    const compareWithMinimum = compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      this.minimumSupportedVersion.version,
    );

    if (compareWithMinimum === 'lower') {
      throw new Error(
        `WORKSPACE_VERSION_TOO_OLD Workspace ${workspaceId} is at version ${currentWorkspaceVersion} which is below the minimum supported version ${this.minimumSupportedVersion.version}`,
      );
    }

    const appVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'Cannot run upgrade command when APP_VERSION is not defined, please double check your env variables',
      );
    }

    const targetVersion = extractVersionMajorMinorPatch(appVersion);

    if (!isDefined(targetVersion)) {
      throw new Error(`Invalid APP_VERSION format: ${appVersion}`);
    }

    const compareWithTarget = compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      targetVersion,
    );

    if (compareWithTarget === 'equal' || compareWithTarget === 'higher') {
      this.logger.log(
        `Workspace ${workspaceId} is already at or above target version ${targetVersion}, skipping upgrade`,
      );

      return;
    }

    const upgradeVersions = this.determineUpgradeVersionPath(
      currentWorkspaceVersion,
      targetVersion,
    );

    if (upgradeVersions.length === 0) {
      this.logger.log(
        `No upgrade path found for ${currentWorkspaceVersion} to ${targetVersion}`,
      );

      return;
    }

    this.logger.log(
      `Upgrading workspace ${workspaceId} from ${currentWorkspaceVersion} to ${targetVersion} through versions: ${upgradeVersions.map((v) => `${v.from} → ${v.to}`).join(' → ')}`,
    );

    const originalFromVersion =
      this.singleVersionUpgradeCommand.fromWorkspaceVersion;

    try {
      for (const versionInfo of upgradeVersions) {
        this.singleVersionUpgradeCommand.fromWorkspaceVersion = new SemVer(
          versionInfo.from,
        );

        await this.selectCommandsForVersion(versionInfo.from);

        this.logger.log(
          `Upgrading from ${versionInfo.from} to ${versionInfo.to} for workspace ${workspaceId}`,
        );

        await this.singleVersionUpgradeCommand.runOnWorkspace(args);

        await this.workspaceRepository.update(
          { id: workspaceId },
          { version: versionInfo.to },
        );

        this.logger.log(
          `Successfully upgraded workspace ${workspaceId} to ${versionInfo.to}`,
        );
      }
    } finally {
      this.singleVersionUpgradeCommand.fromWorkspaceVersion =
        originalFromVersion;
      await this.selectCommandsForVersion(originalFromVersion.version);
    }
  }

  private determineUpgradeVersionPath(
    currentVersion: string,
    targetVersion: string,
  ): Array<{ from: string; to: string }> {
    const targetSemVer = new SemVer(targetVersion);

    const result: Array<{ from: string; to: string }> = [];
    let currentVersionToProcess = currentVersion;

    let hasNextPath = true;

    while (hasNextPath) {
      const nextPath = this.versionPaths.find(
        (path) => path.baseVersion === currentVersionToProcess,
      );

      if (!nextPath) {
        hasNextPath = false;
        continue;
      }

      const nextVersionSemVer = new SemVer(nextPath.targetVersion);

      if (nextVersionSemVer.compare(targetSemVer) > 0) {
        hasNextPath = false;
        continue;
      }

      result.push({
        from: nextPath.baseVersion,
        to: nextPath.targetVersion,
      });

      currentVersionToProcess = nextPath.targetVersion;

      if (currentVersionToProcess === targetVersion) {
        hasNextPath = false;
      }
    }

    return result;
  }

  public validateUpgradePath(
    sourceVersion: string,
    targetVersion: string,
  ): boolean {
    try {
      const path = this.determineUpgradeVersionPath(
        sourceVersion,
        targetVersion,
      );

      return path.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async selectCommandsForVersion(version: string): Promise<void> {
    const success =
      this.singleVersionUpgradeCommand.selectCommandsForVersion(version);

    if (!success) {
      this.logger.warn(
        `No commands found for version ${version}, upgrade may be incomplete`,
      );
    }
  }
}
