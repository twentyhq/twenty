import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { ApplicationVariableUserValueService } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.service';
import { ApplicationVariableUserValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable-user-value.dto';
import { MyApplicationVariableDTO } from 'src/engine/core-modules/application/application-variable/dtos/my-application-variable.dto';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/application/application-variable/dtos/update-application-variable.input';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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

  @Query(() => [MyApplicationVariableDTO])
  async myApplicationVariables(
    @Args('applicationId', { type: () => UUIDScalarType, nullable: true })
    applicationId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<MyApplicationVariableDTO[]> {
    const { targetApplicationId } = resolveTargetApplicationOrThrow({
      callingApplication,
      applicationId,
    });

    assertIsDefinedOrThrow(targetApplicationId);

    return this.applicationVariableUserValueService.findUserValues({
      workspaceId,
      applicationId: targetApplicationId,
      userWorkspaceId,
    });
  }

  @Mutation(() => Boolean)
  async updateMyApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableEntityInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<boolean> {
    const { targetApplicationId } = resolveTargetApplicationOrThrow({
      callingApplication,
      applicationId,
    });

    assertIsDefinedOrThrow(targetApplicationId);

    await this.applicationVariableUserValueService.setUserValue({
      workspaceId,
      applicationId: targetApplicationId,
      userWorkspaceId,
      key,
      plainTextValue: value,
    });

    return true;
  }

  @Query(() => [ApplicationVariableUserValueDTO])
  async applicationVariableUserValues(
    @Args('key') key: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication() callingApplication: FlatApplication,
    @AuthUserWorkspaceId({ allowUndefined: true })
    requestUserWorkspaceId: string | undefined,
  ): Promise<ApplicationVariableUserValueDTO[]> {
    return this.applicationVariableUserValueService.findAllUserValues({
      workspaceId,
      applicationId: callingApplication.id,
      key,
      requestUserWorkspaceId,
    });
  }
}
