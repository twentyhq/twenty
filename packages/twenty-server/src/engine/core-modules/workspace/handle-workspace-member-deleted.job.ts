import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

export type HandleWorkspaceMemberDeletedJobData = {
  workspaceId: string;
  userId: string;
};
@Injectable()
export class HandleWorkspaceMemberDeletedJob
  implements MessageQueueJob<HandleWorkspaceMemberDeletedJobData>
{
  constructor(
    private readonly workspaceService: WorkspaceService,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async handle(data: HandleWorkspaceMemberDeletedJobData): Promise<void> {
    const { workspaceId, userId } = data;
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: userId },
      relations: ['workspace'],
    });

    if (userWorkspaces.length <= 1) {
      await this.userRepository.delete({ id: userId });

      return;
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['defaultWorkspace'],
    });

    if (!user) {
      throw new Error(`User ${userId} not found in workspace ${workspaceId}`);
    }

    if (user.defaultWorkspaceId === workspaceId) {
      await this.workspaceService.reassignDefaultWorkspace(
        workspaceId,
        userId,
        userWorkspaces,
      );
    }
    await this.userWorkspaceRepository.delete({
      userId,
      workspaceId,
    });
  }
}
