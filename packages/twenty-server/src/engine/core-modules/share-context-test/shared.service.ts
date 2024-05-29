import { Injectable } from '@nestjs/common';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class SharedService {
  constructor(
    @InjectWorkspaceRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceRepository<WorkspaceMemberWorkspaceEntity>,
  ) {}

  async getWorkspaceMemberEntityCount(): Promise<number> {
    return this.workspaceMemberRepository.count();
  }
}
