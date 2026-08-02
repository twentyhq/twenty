import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

// User-scoped on purpose: these are the applications this person authorized,
// which they may revoke for themselves without affecting anyone else. Removing
// an integration for the whole workspace is uninstalling it, an admin action
// that lives elsewhere.
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
  ): Promise<ApplicationAuthorizationDTO[]> {
    const authorizations =
      await this.applicationAuthorizationService.findActiveAuthorizationsForUser(
        user.id,
      );

    return authorizations.map((authorization) =>
      this.toApplicationAuthorizationDTO(authorization),
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async revokeApplicationAuthorization(
    @AuthUser() user: AuthContextUser,
    @Args('applicationAuthorizationId', { type: () => UUIDScalarType })
    applicationAuthorizationId: string,
  ): Promise<boolean> {
    return await this.applicationAuthorizationService.revokeAuthorizationById({
      authorizationId: applicationAuthorizationId,
      userId: user.id,
    });
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
