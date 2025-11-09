import { Logger, Scope } from '@nestjs/common';
import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type UpdateWorkspaceMemberEmailJobData = {
  userId: string;
  email: string;
  workspaceIds: string[];
};

@Processor({
  queueName: MessageQueue.workspaceQueue,
  scope: Scope.REQUEST,
})
export class UpdateWorkspaceMemberEmailJob {
  private readonly logger = new Logger(UpdateWorkspaceMemberEmailJob.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly dataSourceService: DataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(UpdateWorkspaceMemberEmailJob.name)
  async handle({
    userId,
    email,
    workspaceIds,
  }: UpdateWorkspaceMemberEmailJobData): Promise<void> {
    if (!workspaceIds.length) {
      return;
    }

    const dataSources = await this.dataSourceService.getManyDataSourceMetadata({
      where: {
        workspaceId: In(workspaceIds),
      },
      order: { createdAt: 'DESC' },
    });

    for (const { workspaceId } of dataSources) {
      try {
        const workspaceMemberRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        await workspaceMemberRepository.update(
          { userId },
          { userEmail: email },
        );
      } catch (error) {
        this.logger.error(
          `Failed to update workspace member email for user ${userId} in workspace ${workspaceId}: ${error.message}`,
        );
      }
    }
  }
}
