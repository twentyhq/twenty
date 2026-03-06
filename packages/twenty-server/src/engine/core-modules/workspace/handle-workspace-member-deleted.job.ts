import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';

export type HandleWorkspaceMemberDeletedJobData = {
  workspaceId: string;
  userId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class HandleWorkspaceMemberDeletedJob {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Process(HandleWorkspaceMemberDeletedJob.name)
  async handle(data: HandleWorkspaceMemberDeletedJobData): Promise<void> {
    const { workspaceId, userId } = data;

    await this.workspaceService.handleRemoveWorkspaceMember(
      workspaceId,
      userId,
    );
  }
}
