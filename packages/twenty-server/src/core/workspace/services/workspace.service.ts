import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';
import { UserService } from 'src/core/user/services/user.service';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly userService: UserService,
  ) {
    super(workspaceRepository);
  }

  async createWorkspace(user: User) {
    const workspaceToCreate = this.workspaceRepository.create({
      displayName: '',
      domainName: '',
      inviteHash: v4(),
      subscriptionStatus: 'active',
    });
    const workspace = await this.workspaceRepository.save(workspaceToCreate);

    await this.userService.updateUser(user.id, { defaultWorkspace: workspace });
    await this.workspaceManagerService.init(user.defaultWorkspace.id);
    await this.userService.createWorkspaceMember(user);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.workspaceManagerService.delete(id);
    await this.workspaceRepository.delete(id);

    return workspace;
  }
}
