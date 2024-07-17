import { Logger } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';

import * as fs from 'fs';
import * as path from 'path';

import { Command, CommandRunner, Option } from 'nest-commander';
import * as semver from 'semver';

import { AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand } from 'src/database/commands/upgrade-version/0-22/0-22-add-new-address-field-to-views-with-deprecated-address.command';
import { FixObjectMetadataIdStandardIdCommand } from 'src/database/commands/upgrade-version/0-22/0-22-fix-object-metadata-id-standard-id.command';
import { UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-boolean-fields-null-default-values-and-null-values.command';
import { UpdateMessageChannelSyncStageEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-stage-enum.command';
import { UpdateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-status-enum.command';

interface UpgradeCommandOptions {
  workspaceId?: string;
}

type UpgradeCommand = new (...args: any[]) => {
  run: (passedParam: string[], options: UpgradeCommandOptions) => Promise<void>;
};

const versionUpgradeMap: Record<string, UpgradeCommand[]> = {
  '0.22': [
    FixObjectMetadataIdStandardIdCommand,
    UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand,
    AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand,
    UpdateMessageChannelSyncStatusEnumCommand,
    UpdateMessageChannelSyncStageEnumCommand,
  ],
  '0.23': [UpdateMessageChannelSyncStageEnumCommand],
};

@Command({
  name: 'upgrade-version',
  description: 'Upgrade to a specific version',
})
export class UpgradeVersionCommand extends CommandRunner {
  private currentVersion: string;
  private readonly logger = new Logger(UpgradeVersionCommand.name);

  constructor(
    private readonly fixObjectMetadataIdStandardIdCommand: FixObjectMetadataIdStandardIdCommand,
    private readonly updateBooleanFieldsNullDefaultValuesAndNullValuesCommand: UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand,
    private readonly addNewAddressFieldToViewsWithDeprecatedAddressFieldCommand: AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand,
    private readonly updateMessageChannelSyncStatusEnumCommand: UpdateMessageChannelSyncStatusEnumCommand,
    private readonly updateMessageChannelSyncStageEnumCommand: UpdateMessageChannelSyncStageEnumCommand,
  ) {
    super();
    this.currentVersion = this.getCurrentCodeVersion();
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

    this.validateVersions(version);

    if (!versionUpgradeMap[version]) {
      throw new Error(
        `No migration commands found for version ${version}. This could mean there were no database changes required for this version.`,
      );
    }

    for (const CommandClass of versionUpgradeMap[version]) {
      const commandInstance = this.getCommandInstance(CommandClass);

      await commandInstance.run(passedParams, upgradeOptions);
    }

    this.logger.log(`Successfully upgraded to version ${version}`);
  }

  private getCommandInstance(CommandClass: UpgradeCommand): {
    run: (
      passedParam: string[],
      options: UpgradeCommandOptions,
    ) => Promise<void>;
  } {
    return this[
      CommandClass.name.charAt(0).toLowerCase() + CommandClass.name.slice(1)
    ] as any;
  }

  private getCurrentCodeVersion(): string {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    return packageJson.version;
  }

  private validateVersions(targetVersion: string): void {
    const cleanCurrentVersion = semver.coerce(this.currentVersion);
    const cleanTargetVersion = semver.coerce(targetVersion);

    if (!cleanCurrentVersion || !cleanTargetVersion) {
      throw new Error(
        `Invalid version format. Current Code: ${this.currentVersion}, Target: ${targetVersion}`,
      );
    }

    if (
      semver.gt(cleanTargetVersion, cleanCurrentVersion) &&
      isUndefined(
        versionUpgradeMap[
          cleanTargetVersion.major.toString() +
            '.' +
            cleanTargetVersion.minor.toString()
        ],
      )
    ) {
      throw new Error(
        `Cannot upgrade to ${cleanTargetVersion}. Your current code version is ${cleanCurrentVersion}. Please update your codebase or upgrade your Docker image first.`,
      );
    }

    this.logger.log(
      `Current Code Version: ${this.currentVersion}, Target: ${targetVersion}`,
    );
  }
}
