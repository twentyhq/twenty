import { Logger } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';

import * as fs from 'fs';
import * as path from 'path';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import * as semver from 'semver';

import { MigrateDomainNameFromTextToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-domain-to-links.command';
import { MigrateLinkFieldsToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-link-fields-to-links.command';
import { MigrateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-message-channel-sync-status-enum.command';
import { SetWorkspaceActivationStatusCommand } from 'src/database/commands/upgrade-version/0-23/0-23-set-workspace-activation-status.command';
import { UpdateActivitiesCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-activities.command';

interface UpgradeCommandOptions {
  workspaceId?: string;
}

type VersionUpgradeMap = {
  [version: string]: CommandRunner[];
};

@Command({
  name: 'upgrade-version',
  description: 'Upgrade to a specific version',
})
export class UpgradeVersionCommand extends CommandRunner {
  private readonly logger = new Logger(UpgradeVersionCommand.name);

  constructor(
    private readonly migrateLinkFieldsToLinksCommand: MigrateLinkFieldsToLinksCommand,
    private readonly migrateDomainNameFromTextToLinksCommand: MigrateDomainNameFromTextToLinksCommand,
    private readonly migrateMessageChannelSyncStatusEnumCommand: MigrateMessageChannelSyncStatusEnumCommand,
    private readonly setWorkspaceActivationStatusCommand: SetWorkspaceActivationStatusCommand,
    private readonly updateActivitiesCommand: UpdateActivitiesCommand,
  ) {
    super();
  }

  @Option({
    flags: '-v, --version <version>',
    description: 'Version to upgrade to',
    required: true,
  })
  parseVersion(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    passedParams: string[],
    options: UpgradeCommandOptions & { version: string },
  ): Promise<void> {
    const { version, ...upgradeOptions } = options;

    const versionUpgradeMap = {
      '0.23': [
        this.migrateLinkFieldsToLinksCommand,
        this.migrateDomainNameFromTextToLinksCommand,
        this.migrateMessageChannelSyncStatusEnumCommand,
        this.setWorkspaceActivationStatusCommand,
        this.updateActivitiesCommand,
      ],
    };

    await this.validateVersions(version, versionUpgradeMap);

    if (!versionUpgradeMap[version]) {
      throw new Error(
        `No migration commands found for version ${version}. This could mean there were no database changes required for this version.`,
      );
    }

    for (const command of versionUpgradeMap[version]) {
      await command.run(passedParams, upgradeOptions);
    }

    this.logger.log(chalk.green(`Successfully upgraded to version ${version}`));
  }

  private async getCurrentCodeVersion(): Promise<string> {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    return packageJson.version;
  }

  private async validateVersions(
    targetVersion: string,
    versionUpgradeMap: VersionUpgradeMap,
  ): Promise<void> {
    const currentVersion = await this.getCurrentCodeVersion();

    const cleanCurrentVersion = semver.coerce(currentVersion);
    const cleanTargetVersion = semver.coerce(targetVersion);

    if (!cleanCurrentVersion || !cleanTargetVersion) {
      throw new Error(
        `Invalid version format. Current Code: ${currentVersion}, Target: ${targetVersion}`,
      );
    }

    const targetMajorMinor = `${cleanTargetVersion.major}.${cleanTargetVersion.minor}`;

    if (
      semver.gt(cleanTargetVersion, cleanCurrentVersion) &&
      isUndefined(versionUpgradeMap[targetMajorMinor])
    ) {
      throw new Error(
        `Cannot upgrade to ${cleanTargetVersion}. Your current code version is ${cleanCurrentVersion}. Please update your codebase or upgrade your Docker image first.`,
      );
    }

    this.logger.log(
      `Current Code Version: ${currentVersion}, Target: ${targetVersion}`,
    );
  }
}
