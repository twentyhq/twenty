import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
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
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@MetadataResolver()
export class WorkspaceApplicationAuthorizationResolver {
  constructor(
    private readonly applicationAuthorizationService: ApplicationAuthorizationService,
  ) {}

  @Query(() => [ApplicationAuthorizationDTO])
  async workspaceApplicationAuthorizations(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
  ): Promise<ApplicationAuthorizationDTO[]> {
    const authorizations =
      await this.applicationAuthorizationService.findActiveAuthorizationsForWorkspaceApplication(
        { workspaceId: workspace.id, applicationId },
      );

    return this.applicationAuthorizationService.toApplicationAuthorizationDtos(
      authorizations,
    );
  }

  @Mutation(() => Boolean)
  async revokeWorkspaceApplicationMemberAccess(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @Args('userId', { type: () => UUIDScalarType })
    userId: string,
  ): Promise<boolean> {
    return await this.applicationAuthorizationService.revokeMemberAuthorizationsForWorkspaceApplication(
      { workspaceId: workspace.id, applicationId, userId },
    );
  }
}
