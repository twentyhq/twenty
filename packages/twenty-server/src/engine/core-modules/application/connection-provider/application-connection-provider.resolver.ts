import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isAbsoluteUrl } from 'twenty-shared/utils';

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

  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent()
    connectionProvider: Pick<
      ApplicationConnectionProviderDTO,
      'applicationId' | 'logo'
    >,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    const logo = connectionProvider.logo;

    if (!isNonEmptyString(logo)) {
      return null;
    }

    if (isAbsoluteUrl(logo)) {
      return logo;
    }

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/${ApiPath.PublicAssets}/${workspace.id}/${connectionProvider.applicationId}/${logo}`;
  }
}
