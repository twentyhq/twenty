import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { SemVer } from 'semver';
import { Repository } from 'typeorm';

import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { UpgradeCommandRunner } from 'src/database/commands/command-runners/upgrade.command-runner';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  fromWorkspaceVersion = new SemVer('0.43.0');

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly environmentService: EnvironmentService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
    protected readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    protected readonly migrateIsSearchableForCustomObjectMetadataCommand: MigrateIsSearchableForCustomObjectMetadataCommand,
    protected readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    protected readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
  ) {
    super(
      workspaceRepository,
      environmentService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );
  }

  override async runBeforeSyncMetadata(args: RunOnWorkspaceArgs) {
    await this.migrateRichTextContentPatchCommand.runOnWorkspace(args);

    await this.migrateIsSearchableForCustomObjectMetadataCommand.runOnWorkspace(
      args,
    );

    await this.migrateSearchVectorOnNoteAndTaskEntitiesCommand.runOnWorkspace(
      args,
    );

    await this.migrateIsSearchableForCustomObjectMetadataCommand.runOnWorkspace(
      args,
    );
  }

  override async runAfterSyncMetadata(args: RunOnWorkspaceArgs) {
    await this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand.runOnWorkspace(
      args,
    );

    await this.addTasksAssignedToMeViewCommand.runOnWorkspace(args);
  }
}
