import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';
import { UserService } from 'src/core/user/services/user.service';
import { ActivateWorkspaceInput } from 'src/core/workspace/dtos/activate-workspace-input';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly userService: UserService,
  ) {
    super(workspaceRepository);
  }

  async activateWorkspace(user: User, data: ActivateWorkspaceInput) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }
    await this.workspaceRepository.update(user.defaultWorkspace.id, {
      displayName: data.displayName,
    });
    await this.workspaceManagerService.init(user.defaultWorkspace.id);
    await this.userService.createWorkspaceMember(user);

    return user.defaultWorkspace;
  }

  async isWorkspaceActivated(id: string): Promise<boolean> {
    return await this.workspaceManagerService.doesDataSourceExist(id);
  }

  async deleteWorkspace(id: string, shouldDeleteCoreWorkspace = true) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.workspaceManagerService.delete(id);
    if (shouldDeleteCoreWorkspace) {
      await this.workspaceRepository.delete(id);
    }

    return workspace;
  }
}
