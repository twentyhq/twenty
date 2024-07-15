import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { FunctionService } from 'src/engine/core-modules/function/function.service';
import { ExecuteFunctionInput } from 'src/engine/core-modules/function/dtos/execute-function.input';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => String)
export class FunctionResolver {
  constructor(private readonly functionService: FunctionService) {}

  @Mutation(() => String)
  async upsertFunction(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('name', { type: () => String }) name: string,
  ) {
    return await this.functionService.upsertFunction(workspaceId, file, name);
  }

  @Mutation(() => String)
  async executeFunction(@Args() executeFunctionInput: ExecuteFunctionInput) {
    const { name, payload } = executeFunctionInput;

    return JSON.stringify(
      await this.functionService.executeFunction(name, payload),
    );
  }
}
