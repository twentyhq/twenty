import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => String)
export class FunctionResolver {
  constructor(
    private readonly functionService: FunctionService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Mutation(() => String)
  async upsertFunction(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('name', { type: () => String }) name: string,
  ) {
    return await this.functionService.upsertFunction(
      workspaceId,
      user,
      file,
      name,
    );
  }
}
