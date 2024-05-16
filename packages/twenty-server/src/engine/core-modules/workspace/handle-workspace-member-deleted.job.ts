import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

export type HandleWorkspaceMemberDeletedJobData = {
  workspaceId: string;
  userId: string;
};
@Injectable()
export class HandleWorkspaceMemberDeletedJob
  implements MessageQueueJob<HandleWorkspaceMemberDeletedJobData>
{
  constructor(private readonly workspaceService: WorkspaceService) {}

  async handle(data: HandleWorkspaceMemberDeletedJobData): Promise<void> {
    const { workspaceId, userId } = data;

    await this.workspaceService.handleRemoveWorkspaceMember(
      workspaceId,
      userId,
    );
  }
}
