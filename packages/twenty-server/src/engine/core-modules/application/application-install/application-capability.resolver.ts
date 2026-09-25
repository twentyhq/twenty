import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationCapabilityGrantDTO } from 'src/engine/core-modules/application/application-install/dtos/application-capability-grant.dto';
import { GrantApplicationCapabilitiesInput } from 'src/engine/core-modules/application/application-install/dtos/grant-application-capabilities.input';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { buildApplicationCapabilityGrantQuery } from 'src/engine/core-modules/application/utils/build-application-capability-grant-query.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  RequireAccessTokenGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationCapabilityResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Mutation(() => ApplicationCapabilityGrantDTO)
  async grantApplicationCapabilities(
    @Args('input') input: GrantApplicationCapabilitiesInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationCapabilityGrantDTO> {
    await this.applicationService.findOneApplicationWithRelationsOrThrow({
      id: input.applicationId,
      workspaceId: workspace.id,
    });

    return this.applicationService.update(input.applicationId, {
      workspaceId: workspace.id,
      grantedCapabilities: () =>
        buildApplicationCapabilityGrantQuery(input.capabilities),
    });
  }
}
