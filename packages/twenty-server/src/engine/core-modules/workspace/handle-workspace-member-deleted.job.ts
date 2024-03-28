import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { UserService } from 'src/engine/core-modules/user/services/user.service';

export type HandleWorkspaceMemberDeletedJobData = {
  workspaceId: string;
  userId: string;
};
@Injectable()
export class HandleWorkspaceMemberDeletedJob
  implements MessageQueueJob<HandleWorkspaceMemberDeletedJobData>
{
  constructor(private readonly userService: UserService) {}

  async handle(data: HandleWorkspaceMemberDeletedJobData): Promise<void> {
    const { workspaceId, userId } = data;

    await this.userService.handleRemoveWorkspaceMember(workspaceId, userId);
  }
}
