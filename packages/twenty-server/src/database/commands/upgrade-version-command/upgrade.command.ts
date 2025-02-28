import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
    protected readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    protected readonly migrateIsSearchableForCustomObjectMetadataCommand: MigrateIsSearchableForCustomObjectMetadataCommand,
    protected readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    protected readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      chalk.blue(
        `${args.options.dryRun ? '(dry run)' : ''} Upgrading workspace ${args.workspaceId} ${args.index + 1}/${args.total}`,
      ),
    );

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

    await this.syncWorkspaceMetadataCommand.runOnWorkspace(args);

    await this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand.runOnWorkspace(
      args,
    );

    await this.addTasksAssignedToMeViewCommand.runOnWorkspace(args);

    this.logger.log(
      chalk.blue(`Upgrade for workspace ${args.workspaceId} completed.`),
    );
  }
}
