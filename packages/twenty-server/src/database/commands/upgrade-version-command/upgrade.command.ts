import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
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
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-50/0-50-migrate-relations-to-field-metadata.command';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

type VersionCommands = {
  beforeSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
  afterSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
};
@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  fromWorkspaceVersion = new SemVer('0.43.0');
  private commands: VersionCommands;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly environmentService: EnvironmentService,
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

    // 0.50 Commands
    protected readonly migrateRelationsToFieldMetadataCommand: MigrateRelationsToFieldMetadataCommand,
  ) {
    super(
      workspaceRepository,
      environmentService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );

    const _commands_043: VersionCommands = {
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
    const commands_044: VersionCommands = {
      beforeSyncMetadata: [
        this.initializePermissionsCommand,
        this.updateViewAggregateOperationsCommand,
      ],
      afterSyncMetadata: [],
    };
    const _commands_050: VersionCommands = {
      beforeSyncMetadata: [this.migrateRelationsToFieldMetadataCommand],
      afterSyncMetadata: [],
    };

    this.commands = commands_044;
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
}
