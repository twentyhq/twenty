import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateAndConnectJunctionRecordInput } from 'src/engine/core-modules/record-crud/dtos/create-and-connect-junction-record.input';
import { CreateAndConnectJunctionRecordResultDto } from 'src/engine/core-modules/record-crud/dtos/create-and-connect-junction-record-result.dto';
import { CreateAndConnectJunctionRecordService } from 'src/engine/core-modules/record-crud/services/create-and-connect-junction-record.service';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
export class CreateAndConnectJunctionRecordResolver {
  constructor(
    private readonly createAndConnectJunctionRecordService: CreateAndConnectJunctionRecordService,
  ) {}

  @Mutation(() => CreateAndConnectJunctionRecordResultDto)
  async createAndConnectJunctionRecord(
    @Args('input') input: CreateAndConnectJunctionRecordInput,
  ): Promise<CreateAndConnectJunctionRecordResultDto> {
    try {
      return await this.createAndConnectJunctionRecordService.execute({
        input,
        authContext: getWorkspaceAuthContext(),
      });
    } catch (error) {
      workspaceQueryRunnerGraphqlApiExceptionHandler(error);

      throw error;
    }
  }
}
