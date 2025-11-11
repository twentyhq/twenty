import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type UpdateWorkspaceMemberEmailJobData = {
  userId: string;
  email: string;
};

@Processor({
  queueName: MessageQueue.workspaceQueue,
  scope: Scope.REQUEST,
})
export class UpdateWorkspaceMemberEmailJob {
  private readonly logger = new Logger(UpdateWorkspaceMemberEmailJob.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(UpdateWorkspaceMemberEmailJob.name)
  async handle({
    userId,
    email,
  }: UpdateWorkspaceMemberEmailJobData): Promise<void> {
    const workspace =
      await this.userWorkspaceService.findFirstWorkspaceByUserId(userId);

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    await workspaceMemberRepository.update({ userId }, { userEmail: email });
  }
}
