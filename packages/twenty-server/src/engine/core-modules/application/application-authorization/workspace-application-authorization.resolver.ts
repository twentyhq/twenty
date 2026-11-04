import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WORKSPACE_APPLICATION_AUTHORIZATION_ACCESS_POLICY } from 'src/engine/core-modules/application/application-authorization/constants/workspace-application-authorization-access-policy.constant';
import { ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { toApplicationAuthorizationDto } from 'src/engine/core-modules/application/application-authorization/utils/to-application-authorization-dto.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(AccessPolicyGuard(WORKSPACE_APPLICATION_AUTHORIZATION_ACCESS_POLICY))
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

    return authorizations.map(toApplicationAuthorizationDto);
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
