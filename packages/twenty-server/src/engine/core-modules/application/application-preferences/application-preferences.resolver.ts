import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationHealthCheckService } from 'src/engine/core-modules/application/application-health/application-health-check.service';
import { ApplicationPreferencesService } from 'src/engine/core-modules/application/application-preferences/application-preferences.service';
import { ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

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
  SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationPreferencesResolver {
  constructor(
    private readonly applicationPreferencesService: ApplicationPreferencesService,
    private readonly applicationHealthCheckService: ApplicationHealthCheckService,
  ) {}

  @Query(() => [ApplicationPreferencesDTO])
  async myApplicationPreferences(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationPreferencesDTO[]> {
    return this.applicationPreferencesService.findMyApplicationPreferences({
      workspaceId,
      userWorkspaceId,
    });
  }

  @Mutation(() => ApplicationHealthCheckResultDTO, { nullable: true })
  @UseFilters(ApplicationExceptionFilter, ThrottlerGraphqlApiExceptionFilter)
  async runMyApplicationHealthCheck(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationHealthCheckResultDTO | null> {
    return await this.applicationHealthCheckService.runForUser({
      applicationId,
      workspaceId,
      userId,
      userWorkspaceId,
    });
  }
}
