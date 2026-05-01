import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationOAuthProviderDTO } from 'src/engine/core-modules/application/application-oauth-provider/dtos/application-oauth-provider.dto';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ApplicationOAuthProviderDTO)
export class ApplicationOAuthProviderResolver {
  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
  ) {}

  // Lists OAuth providers an application declares. Frontend uses this to
  // render the "Connect <provider>" buttons in the app settings tab.
  @Query(() => [ApplicationOAuthProviderDTO])
  @UseGuards(NoPermissionGuard)
  async applicationOAuthProviders(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationOAuthProviderDTO[]> {
    return this.oauthProviderService.findManyByApplication({
      applicationId,
      workspaceId: workspace.id,
    });
  }
}
