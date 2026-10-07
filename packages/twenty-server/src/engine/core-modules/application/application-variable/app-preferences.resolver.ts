import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { AppPreferencesService } from 'src/engine/core-modules/application/application-variable/app-preferences.service';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { AppPreferencesApplicationDTO } from 'src/engine/core-modules/application/application-variable/dtos/app-preferences-application.dto';
import { UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

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
  NoPermissionGuard,
  FeatureFlagGuard,
)
@MetadataResolver()
@UseFilters(
  ApplicationVariableEntityExceptionFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class AppPreferencesResolver {
  constructor(private readonly appPreferencesService: AppPreferencesService) {}

  @Query(() => [AppPreferencesApplicationDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APP_PREFERENCES_ENABLED)
  async myAppPreferencesApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AppPreferencesApplicationDTO[]> {
    return this.appPreferencesService.findApplicationsWithUserVariables({
      workspaceId,
    });
  }

  @Query(() => [UserApplicationVariableValueDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APP_PREFERENCES_ENABLED)
  @UseGuards(ApplicationTargetGuard)
  async myAppPreferencesApplicationVariables(
    @ApplicationTargetArg(
      'applicationUniversalIdentifier',
      {
        kind: 'applicationUniversalIdentifier',
        requireApplicationRegistrationOwnership: false,
      },
      { type: () => UUIDScalarType },
    )
    applicationUniversalIdentifier: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<UserApplicationVariableValueDTO[]> {
    return this.appPreferencesService.findMyApplicationVariablesOrThrow({
      applicationUniversalIdentifier,
      workspaceId,
      userWorkspaceId,
    });
  }
}
