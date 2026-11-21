import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationIframeMediaPermissionService } from 'src/engine/core-modules/application/application-install/application-iframe-media-permission.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { IframeMediaPermissionInput } from 'src/engine/core-modules/application/dtos/iframe-media-permission.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => ApplicationDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
  }),
)
export class ApplicationIframeMediaPermissionResolver {
  constructor(
    private readonly applicationIframeMediaPermissionService: ApplicationIframeMediaPermissionService,
  ) {}

  @Mutation(() => ApplicationDTO)
  approveApplicationIframeMediaPermissions(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @Args('approvedIframeMediaPermissions', {
      type: () => [IframeMediaPermissionInput],
    })
    approvedIframeMediaPermissions: IframeMediaPermissionInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationEntity> {
    return this.applicationIframeMediaPermissionService.approve({
      applicationId,
      workspaceId,
      approvedIframeMediaPermissions,
    });
  }
}
