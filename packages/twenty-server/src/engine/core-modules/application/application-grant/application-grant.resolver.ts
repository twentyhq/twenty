import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationGrantDTO } from 'src/engine/core-modules/application/application-grant/dtos/application-grant.dto';
import { UpdateApplicationGrantObjectAccessInput } from 'src/engine/core-modules/application/application-grant/dtos/update-application-grant-object-access.input';
import { ApplicationGrantService } from 'src/engine/core-modules/application/application-grant/services/application-grant.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  SettingsPermissionGuard([
    PermissionFlagType.APPLICATIONS,
    PermissionFlagType.ROLES,
  ]),
)
export class ApplicationGrantResolver {
  constructor(
    private readonly applicationGrantService: ApplicationGrantService,
  ) {}

  @Query(() => ApplicationGrantDTO)
  async applicationGrant(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId,
    });
  }

  @Mutation(() => ApplicationGrantDTO)
  async updateApplicationGrantObjectAccess(
    @Args('input') input: UpdateApplicationGrantObjectAccessInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    await this.applicationGrantService.updateGrantObjectAccess({
      workspaceId: workspace.id,
      applicationId: input.applicationId,
      objectAccess: input.objectAccess,
    });

    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId: input.applicationId,
    });
  }

  @Mutation(() => ApplicationGrantDTO)
  async approveApplicationGrantPendingPermissions(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationGrantDTO> {
    await this.applicationGrantService.approvePendingPermissions({
      workspaceId: workspace.id,
      applicationId,
    });

    return this.applicationGrantService.getGrant({
      workspaceId: workspace.id,
      applicationId,
    });
  }
}
