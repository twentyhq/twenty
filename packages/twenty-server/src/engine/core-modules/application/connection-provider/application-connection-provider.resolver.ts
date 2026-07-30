import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { isAbsoluteUrl, isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationConnectionProviderDTO } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ApplicationConnectionProviderDTO)
export class ApplicationConnectionProviderResolver {
  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // Mirrors ApplicationResolver.logoUrl: resolves the manifest-relative logo
  // path into a servable url via the app's public-assets static route.
  private resolveLogoUrl({
    logo,
    workspaceId,
    applicationId,
  }: {
    logo: string | null;
    workspaceId: string;
    applicationId: string;
  }): string | null {
    if (!isDefined(logo) || logo.length === 0) {
      return null;
    }

    if (isAbsoluteUrl(logo)) {
      return logo;
    }

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/public-assets/${workspaceId}/${applicationId}/${logo}`;
  }

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

    const credentialsConfiguredByProviderId =
      await this.oauthProviderService.areClientCredentialsConfiguredBatch(
        providers,
      );

    return providers.map((provider) => ({
      id: provider.id,
      applicationId: provider.applicationId,
      type: provider.type,
      name: provider.name,
      displayName: provider.displayName,
      logo: provider.logo,
      logoUrl: this.resolveLogoUrl({
        logo: provider.logo,
        workspaceId: workspace.id,
        applicationId: provider.applicationId,
      }),
      oauth:
        provider.type === 'oauth' && provider.oauthConfig
          ? {
              scopes: provider.oauthConfig.scopes,
              isClientCredentialsConfigured:
                credentialsConfiguredByProviderId.get(provider.id) ?? false,
            }
          : null,
    }));
  }
}
