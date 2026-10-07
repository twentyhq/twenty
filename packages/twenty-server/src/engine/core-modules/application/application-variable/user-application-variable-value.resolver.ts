import { UseFilters, UseGuards } from '@nestjs/common';
import { Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { UpdateMyUserApplicationVariableInput } from 'src/engine/core-modules/application/application-variable/dtos/update-my-user-application-variable.input';
import { WorkspaceMemberApplicationVariablesDTO } from 'src/engine/core-modules/application/application-variable/dtos/workspace-member-application-variables.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  NoPermissionGuard,
)
@MetadataResolver()
@UseFilters(
  ApplicationVariableEntityExceptionFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class UserApplicationVariableValueResolver {
  constructor(
    private readonly userApplicationVariableValueService: UserApplicationVariableValueService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    ApplicationTargetGuard,
  )
  async updateMyUserApplicationVariable(
    @ApplicationTargetArgs<UpdateMyUserApplicationVariableInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    {
      applicationUniversalIdentifier,
      key,
      value,
    }: UpdateMyUserApplicationVariableInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    await this.userApplicationVariableValueService.updateMyUserApplicationVariable(
      {
        workspaceId,
        applicationUniversalIdentifier,
        userWorkspaceId,
        key,
        plainTextValue: value,
      },
    );

    return true;
  }

  @Query(() => [WorkspaceMemberApplicationVariablesDTO])
  async myUserApplicationVariables(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication() callingApplication: FlatApplication,
    @AuthUserWorkspaceId({ allowUndefined: true })
    requestUserWorkspaceId: string | undefined,
  ): Promise<WorkspaceMemberApplicationVariablesDTO[]> {
    return this.userApplicationVariableValueService.findUserApplicationVariableValues(
      {
        workspaceId,
        applicationId: callingApplication.id,
        requestUserWorkspaceId,
      },
    );
  }
}
