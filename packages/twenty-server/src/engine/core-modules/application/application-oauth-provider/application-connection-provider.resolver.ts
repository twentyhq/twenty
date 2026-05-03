import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationConnectionProviderDTO } from 'src/engine/core-modules/application/application-oauth-provider/dtos/application-connection-provider.dto';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Public-facing resolver for the discriminated ApplicationConnectionProvider
// concept. Today the only `type` is `oauth`, backed by the OAuth-specific
// applicationOAuthProvider table internally. Future credential types will
// add their own backing tables, and this resolver will union over them
// without changing the GraphQL surface.
@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ApplicationConnectionProviderDTO)
export class ApplicationConnectionProviderResolver {
  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
  ) {}

  // Lists connection providers an application declares. Frontend uses this
  // to render the "Add connection" buttons in the app settings tab.
  @Query(() => [ApplicationConnectionProviderDTO])
  @UseGuards(NoPermissionGuard)
  async applicationConnectionProviders(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationConnectionProviderDTO[]> {
    const providers = await this.oauthProviderService.findManyByApplication({
      applicationId,
      workspaceId: workspace.id,
    });

    // One extra round-trip per provider — typical app has 1-3 providers, so
    // not worth a join. Surface a non-actionable hint to the user when the
    // server admin hasn't configured the credentials yet.
    return Promise.all(
      providers.map(async (provider) => ({
        id: provider.id,
        applicationId: provider.applicationId,
        type: 'oauth' as const,
        name: provider.name,
        displayName: provider.displayName,
        icon: provider.icon,
        oauth: {
          scopes: provider.scopes,
          isClientCredentialsConfigured:
            await this.oauthProviderService.areClientCredentialsConfigured(
              provider,
            ),
        },
      })),
    );
  }
}
