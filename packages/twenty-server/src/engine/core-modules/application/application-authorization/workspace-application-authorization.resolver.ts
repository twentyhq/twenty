import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationConnectedMemberCountDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-connected-member-count.dto';
import { ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { toApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/utils/to-application-authorization-dto.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
  }),
)
@MetadataResolver()
export class WorkspaceApplicationAuthorizationResolver {
  constructor(
    private readonly applicationAuthorizationService: ApplicationAuthorizationService,
  ) {}

  @Query(() => [ApplicationAuthorizationDTO])
  async workspaceApplicationAuthorizations(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('applicationId', { type: () => UUIDScalarType, nullable: true })
    applicationId?: string | null,
  ): Promise<ApplicationAuthorizationDTO[]> {
    const authorizations =
      await this.applicationAuthorizationService.findActiveAuthorizationsForWorkspace(
        {
          workspaceId: workspace.id,
          applicationId: applicationId ?? undefined,
        },
      );

    return authorizations.map(toApplicationAuthorizationDTO);
  }

  @Query(() => [ApplicationConnectedMemberCountDTO])
  async workspaceApplicationConnectedMemberCounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationConnectedMemberCountDTO[]> {
    return await this.applicationAuthorizationService.countActiveAuthorizationsByApplicationForWorkspace(
      { workspaceId: workspace.id },
    );
  }

  @Mutation(() => Boolean)
  async revokeWorkspaceApplicationAuthorization(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('applicationAuthorizationId', { type: () => UUIDScalarType })
    applicationAuthorizationId: string,
  ): Promise<boolean> {
    return await this.applicationAuthorizationService.revokeAuthorizationByIdForWorkspace(
      {
        authorizationId: applicationAuthorizationId,
        workspaceId: workspace.id,
      },
    );
  }
}
