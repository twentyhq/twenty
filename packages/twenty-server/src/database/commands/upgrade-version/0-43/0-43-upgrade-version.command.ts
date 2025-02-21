import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { StandardizationOfActorCompositeContextTypeCommand } from 'src/database/commands/upgrade-version/0-42/0-42-standardization-of-actor-composite-context-type';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Command({
  name: 'upgrade-0.43',
  description: 'Upgrade to 0.43',
})
export class UpgradeTo0_43Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    private readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
    private readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    private readonly standardizationOfActorCompositeContextTypeCommand: StandardizationOfActorCompositeContextTypeCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to upgrade to 0.43');

    await this.addTasksAssignedToMeViewCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.migrateSearchVectorOnNoteAndTaskEntitiesCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    // Note: Introduced in 0.42, ran manually on prod. Introduced to self-host globally on 0.43
    await this.standardizationOfActorCompositeContextTypeCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
