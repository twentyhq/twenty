import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(UpdateWorkspaceMemberEmailJob.name)
  async handle({
    userId,
    email,
  }: UpdateWorkspaceMemberEmailJobData): Promise<void> {
    const workspace =
      await this.userWorkspaceService.findFirstWorkspaceByUserId(userId);

    const authContext = buildSystemAuthContext(workspace.id);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspace.id,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        await workspaceMemberRepository.update(
          { userId },
          { userEmail: email },
        );
      },
    );
  }
}
