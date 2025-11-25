import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  WorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-12:create-workspace-custom-application',
  description:
    'Create workspace-custom application for workspaces that do not have them',
})
export class CreateWorkspaceCustomApplicationCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, [
      WorkspaceActivationStatus.ONGOING_CREATION,
      WorkspaceActivationStatus.PENDING_CREATION,
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.INACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Checking standard applications for workspace ${workspaceId}`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new Error(`${workspaceId} workspace not found`);
    }

    if (isDefined(workspace.workspaceCustomApplicationId)) {
      this.logger.log(
        `${workspaceId} skipping custom workspace application creation as already exists`,
      );

      return;
    }

    const customWorkspaceApplication =
      await this.applicationService.createWorkspaceCustomApplication({
        workspaceId,
        workspaceDisplayName: workspace.displayName,
      });

    await this.workspaceRepository.update(workspace.id, {
      workspaceCustomApplicationId: customWorkspaceApplication.id,
    });

    this.logger.log(`Successfully create workspace custom application`);
  }
}
