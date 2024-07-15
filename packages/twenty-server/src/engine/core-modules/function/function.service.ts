import { Injectable } from '@nestjs/common';

import { FileUpload } from 'graphql-upload';

import { User } from 'src/engine/core-modules/user/user.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  FunctionSyncStatus,
  FunctionWorkspaceEntity,
} from 'src/modules/function/standard-objects/function.workspace-entity';
import { CustomCodeEngineService } from 'src/engine/integrations/custom-code-engine/custom-code-engine.service';

@Injectable()
export class FunctionService {
  constructor(
    private readonly customCodeEngineService: CustomCodeEngineService,
    private readonly userService: UserService,
    @InjectWorkspaceRepository(FunctionWorkspaceEntity)
    private readonly functionRepository: WorkspaceRepository<FunctionWorkspaceEntity>,
  ) {}

  async executeFunction(
    user: User,
    workspaceId: string,
    name: string,
    payload: object | undefined = undefined,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    const functionToExecute = await this.functionRepository.findOneOrFail({
      where: {
        name,
        authorId: workspaceMember?.id,
      },
    });

    return this.customCodeEngineService.execute(functionToExecute, payload);
  }

  async upsertFunction(
    user: User,
    workspaceId: string,
    file: FileUpload,
    name: string,
  ) {
    const { sourceCodePath, buildSourcePath } =
      await this.customCodeEngineService.generateExecutable(
        name,
        workspaceId,
        file,
      );

    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    const existingFunction = await this.functionRepository.findOne({
      where: { name },
    });

    if (!existingFunction) {
      await this.functionRepository.save({
        name,
        author: workspaceMember,
        sourceCodePath,
        buildSourcePath,
        syncStatus: FunctionSyncStatus.READY,
      });
    } else {
      await this.functionRepository.update(existingFunction.id, {
        name,
        author: workspaceMember,
        sourceCodePath,
        buildSourcePath,
        syncStatus: FunctionSyncStatus.READY,
      });
    }

    return sourceCodePath;
  }
}
