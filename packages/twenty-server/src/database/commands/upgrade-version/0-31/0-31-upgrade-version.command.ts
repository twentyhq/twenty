import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { AddIndexKeyToTasksAndNotesViewsCommand } from 'src/database/commands/upgrade-version/0-31/0-31-add-index-key-to-tasks-and-notes-views.command';
import { BackfillWorkspaceFavoritesCommand } from 'src/database/commands/upgrade-version/0-31/0-31-backfill-workspace-favorites.command';
import { CleanViewsAssociatedWithOutdatedObjectsCommand } from 'src/database/commands/upgrade-version/0-31/0-31-clean-views-associated-with-outdated-objects.command';
import { DeleteNameColumnStandardObjectTablesCommand } from 'src/database/commands/upgrade-version/0-31/0-31-delete-name-column-standard-object-tables.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_31CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.31',
  description: 'Upgrade to 0.31',
})
export class UpgradeTo0_31Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly backfillWorkspaceFavoritesCommand: BackfillWorkspaceFavoritesCommand,
    private readonly cleanViewsAssociatedWithOutdatedObjectsCommand: CleanViewsAssociatedWithOutdatedObjectsCommand,
    private readonly addIndexKeyToTasksAndNotesViewsCommand: AddIndexKeyToTasksAndNotesViewsCommand,
    private readonly deleteNameColumnStandardObjectTablesCommand: DeleteNameColumnStandardObjectTablesCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_31CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.syncWorkspaceMetadataCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
        force: true,
      },
      workspaceIds,
    );
    await this.cleanViewsAssociatedWithOutdatedObjectsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.addIndexKeyToTasksAndNotesViewsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.backfillWorkspaceFavoritesCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.deleteNameColumnStandardObjectTablesCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
