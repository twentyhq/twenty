import { UseFilters, UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationConnectionPriceDTO } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-price.dto';
import { ApplicationConnectionProviderDTO } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';
import { collectDeclaredApplicationPrices } from 'src/engine/core-modules/billing/utils/collect-declared-application-prices.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
@MetadataResolver(() => ApplicationConnectionProviderDTO)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationConnectionProviderResolver {
  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => [ApplicationConnectionProviderDTO])
  @UseGuards(ApplicationTargetGuard)
  async applicationConnectionProviders(
    @ApplicationTargetArg(
      'applicationId',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationConnectionProviderDTO[]> {
    return this.oauthProviderService.findManyDtosByApplications({
      applicationIds: [applicationId],
      workspaceId: workspace.id,
    });
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
    return buildPublicAssetLogoUrl({
      logo: connectionProvider.logo,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      workspaceId: workspace.id,
      applicationId: connectionProvider.applicationId,
    });
  }

  // Lets the front ask for consent before a new connection adds a billed unit
  @ResolveField(() => [ApplicationConnectionPriceDTO])
  async connectedAccountPrices(
    @Parent()
    connectionProvider: Pick<ApplicationConnectionProviderDTO, 'applicationId'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationConnectionPriceDTO[]> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return [];
    }

    const { flatApplicationMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
        'featureFlagsMap',
      ]);

    const application =
      flatApplicationMaps.byId[connectionProvider.applicationId];

    if (
      !featureFlagsMap[FeatureFlagKey.IS_APPLICATION_PRICE_BILLING_ENABLED] ||
      !isDefined(application)
    ) {
      return [];
    }

    return collectDeclaredApplicationPrices({ applications: [application] })
      .filter(({ price }) => price.per === 'CONNECTED_ACCOUNT')
      .map(({ price }) => ({
        universalIdentifier: price.universalIdentifier,
        label: price.label,
        amountCents: price.amountCents,
        currency: price.currency ?? 'USD',
        billingPeriod: price.billingPeriod,
      }));
  }
}
