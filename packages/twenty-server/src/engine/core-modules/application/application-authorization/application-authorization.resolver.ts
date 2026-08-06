import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { isDefined } from 'twenty-shared/utils';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

// Scoped to this person within this workspace: an authorization grants an
// application access to one workspace's data, so it is listed and revoked from
// that workspace only, and revoking affects nobody else. Removing an
// integration for the whole workspace is uninstalling it, an admin action that
// lives elsewhere.
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class ApplicationAuthorizationResolver {
  constructor(
    private readonly applicationAuthorizationService: ApplicationAuthorizationService,
  ) {}

  @Query(() => [ApplicationAuthorizationDTO])
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async currentUserApplicationAuthorizations(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace({ allowUndefined: true }) workspace:
      | WorkspaceEntity
      | undefined,
  ): Promise<ApplicationAuthorizationDTO[]> {
    // UserAuthGuard admits workspace-agnostic credentials, which have no
    // workspace to scope to. Nothing is in scope rather than everything.
    if (!isDefined(workspace)) {
      return [];
    }

    const authorizations =
      await this.applicationAuthorizationService.findActiveAuthorizationsForUserWorkspace(
        { userId: user.id, workspaceId: workspace.id },
      );

    return authorizations.map((authorization) =>
      this.toApplicationAuthorizationDTO(authorization),
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async revokeApplicationAuthorization(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace({ allowUndefined: true }) workspace:
      | WorkspaceEntity
      | undefined,
    @Args('applicationAuthorizationId', { type: () => UUIDScalarType })
    applicationAuthorizationId: string,
  ): Promise<boolean> {
    if (!isDefined(workspace)) {
      return false;
    }

    return await this.applicationAuthorizationService.revokeAuthorizationByIdForUserWorkspace(
      {
        authorizationId: applicationAuthorizationId,
        userId: user.id,
        workspaceId: workspace.id,
      },
    );
  }

  private toApplicationAuthorizationDTO(
    authorization: ApplicationAuthorizationEntity,
  ): ApplicationAuthorizationDTO {
    return {
      id: authorization.id,
      applicationId: authorization.applicationId,
      workspaceId: authorization.workspaceId,
      applicationName: authorization.application.name,
      applicationUniversalIdentifier:
        authorization.application.universalIdentifier,
      scopes: authorization.scopes,
      lastAuthorizedAt: authorization.lastAuthorizedAt,
      lastUsedAt: authorization.lastUsedAt,
      createdAt: authorization.createdAt,
    };
  }
}
