import { UseFilters, UseGuards } from '@nestjs/common';
import { Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { ApplicationVariableUserValueService } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.service';
import { ApplicationVariableUserValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable-user-value.dto';
import { UpdateMyApplicationVariableInput } from 'src/engine/core-modules/application/application-variable/dtos/update-my-application-variable.input';
import { WorkspaceMemberApplicationVariablesDTO } from 'src/engine/core-modules/application/application-variable/dtos/workspace-member-application-variables.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver()
@UseFilters(
  ApplicationVariableEntityExceptionFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class ApplicationVariableUserValueResolver {
  constructor(
    private readonly applicationVariableUserValueService: ApplicationVariableUserValueService,
  ) {}

  @Query(() => [ApplicationVariableUserValueDTO])
  async myApplicationVariables(
    @ApplicationTargetArg('applicationUniversalIdentifier', {
      kind: 'applicationUniversalIdentifier',
    })
    applicationUniversalIdentifier: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationVariableUserValueDTO[]> {
    return this.applicationVariableUserValueService.findMyApplicationVariables({
      workspaceId,
      applicationUniversalIdentifier,
      userWorkspaceId,
    });
  }

  @Mutation(() => Boolean)
  async updateMyApplicationVariable(
    @ApplicationTargetArgs<UpdateMyApplicationVariableInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'applicationUniversalIdentifier',
    })
    {
      applicationUniversalIdentifier,
      key,
      value,
    }: UpdateMyApplicationVariableInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    await this.applicationVariableUserValueService.updateMyApplicationVariable({
      workspaceId,
      applicationUniversalIdentifier,
      userWorkspaceId,
      key,
      plainTextValue: value,
    });

    return true;
  }

  @Query(() => [WorkspaceMemberApplicationVariablesDTO])
  async applicationVariableUserValues(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication() callingApplication: FlatApplication,
    @AuthUserWorkspaceId({ allowUndefined: true })
    requestUserWorkspaceId: string | undefined,
  ): Promise<WorkspaceMemberApplicationVariablesDTO[]> {
    return this.applicationVariableUserValueService.findApplicationVariableUserValues(
      {
        workspaceId,
        applicationId: callingApplication.id,
        requestUserWorkspaceId,
      },
    );
  }
}
