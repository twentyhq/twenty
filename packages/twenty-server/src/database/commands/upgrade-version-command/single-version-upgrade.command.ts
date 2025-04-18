import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { SemVer } from 'semver';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { UpgradeCommandRunner } from 'src/database/commands/command-runners/upgrade.command-runner';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-initialize-permissions.command';
import { UpdateViewAggregateOperationsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-update-view-aggregate-operations.command';
import { UpgradeCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/0-51/0-51-update-workflow-trigger-type-enum.command';
import { getVersionDirName } from 'src/database/commands/upgrade-version-command/version-utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

type VersionCommands = {
  beforeSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
  afterSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
};

@Command({
  name: 'upgrade-specific-version',
  description: 'Upgrade workspaces to a specific version',
})
export class SingleVersionUpgradeCommand extends UpgradeCommandRunner {
  // Source version for the upgrade command
  fromWorkspaceVersion = new SemVer('0.51.0');

  // Target version for the upgrade command
  toWorkspaceVersion = new SemVer('0.52.0');

  private commands: VersionCommands;

  // Store the command sets for each version
  private versionCommands: Record<string, VersionCommands> = {};

  // Version parameter
  private targetVersion: string | undefined;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    // 0.43 Commands
    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
    protected readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    protected readonly migrateIsSearchableForCustomObjectMetadataCommand: MigrateIsSearchableForCustomObjectMetadataCommand,
    protected readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    protected readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,

    // 0.44 Commands
    protected readonly initializePermissionsCommand: InitializePermissionsCommand,
    protected readonly updateViewAggregateOperationsCommand: UpdateViewAggregateOperationsCommand,

    // 0.51 Commands
    protected readonly upgradeCreatedByEnumCommand: UpgradeCreatedByEnumCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );

    this.versionCommands['0.43.0'] = {
      beforeSyncMetadata: [
        this.migrateRichTextContentPatchCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
        this.migrateSearchVectorOnNoteAndTaskEntitiesCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
      ],
      afterSyncMetadata: [
        this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
        this.addTasksAssignedToMeViewCommand,
      ],
    };

    this.versionCommands['0.44.0'] = {
      beforeSyncMetadata: [
        this.initializePermissionsCommand,
        this.updateViewAggregateOperationsCommand,
      ],
      afterSyncMetadata: [],
    };

    this.versionCommands['0.50.0'] = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    this.versionCommands['0.51.0'] = {
      beforeSyncMetadata: [this.upgradeCreatedByEnumCommand],
      afterSyncMetadata: [],
    };

    this.selectCommandsForVersion(this.fromWorkspaceVersion.version);
  }

  @Option({
    flags: '--version [version]',
    description: 'Target version to upgrade to',
    required: true,
  })
  parseVersion(value: string): string {
    try {
      const version = new SemVer(value);

      this.targetVersion = value;

      if (this.selectCommandsForVersion(value)) {
        this.fromWorkspaceVersion = version; // Use existing version object
      } else {
        throw new Error(`No command set available for version ${value}`);
      }

      return value;
    } catch (error) {
      throw new Error(`Invalid version format: ${value}`);
    }
  }

  public selectCommandsForVersion(version: string): boolean {
    if (this.versionCommands[version]) {
      this.commands = this.versionCommands[version];

      return true;
    }

    return false;
  }

  public getDirectoryForVersion(version: string): string | null {
    return getVersionDirName(version);
  }

  override async runBeforeSyncMetadata(args: RunOnWorkspaceArgs) {
    for (const command of this.commands.beforeSyncMetadata) {
      await command.runOnWorkspace(args);
    }
  }

  override async runAfterSyncMetadata(args: RunOnWorkspaceArgs) {
    for (const command of this.commands.afterSyncMetadata) {
      await command.runOnWorkspace(args);
    }
  }

  override async runMigrationCommand(passedParams: string[], options: any) {
    if (!this.targetVersion) {
      throw new Error('Target version must be specified using --version');
    }

    return super.runMigrationCommand(passedParams, options);
  }
}
