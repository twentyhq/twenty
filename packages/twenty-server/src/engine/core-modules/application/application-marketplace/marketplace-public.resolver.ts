import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { findWellKnownOAuthClientByUniversalIdentifier } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-universal-identifier.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@MetadataResolver()
@UseFilters(ApplicationRegistrationExceptionFilter)
export class MarketplacePublicResolver {
  constructor(
    private readonly marketplaceQueryService: MarketplaceQueryService,
  ) {}

  @Query(() => [MarketplaceAppDTO], { name: 'publicMarketplaceApps' })
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async findManyPublicMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    const marketplaceApps =
      await this.marketplaceQueryService.findManyMarketplaceApps({
        isListed: true,
      });

    // Well-known clients are gated in-app by IS_APP_PREFERENCES_ENABLED,
    // and a public request has no workspace to read that flag from
    return marketplaceApps.filter(
      (marketplaceApp) =>
        !isDefined(
          findWellKnownOAuthClientByUniversalIdentifier(marketplaceApp.id),
        ),
    );
  }

  @Query(() => MarketplaceAppDetailDTO, { name: 'publicMarketplaceAppDetail' })
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async findPublicMarketplaceAppDetail(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<MarketplaceAppDetailDTO> {
    const detail =
      await this.marketplaceQueryService.findMarketplaceAppDetail(
        universalIdentifier,
      );

    if (
      !detail.isListed ||
      isDefined(
        findWellKnownOAuthClientByUniversalIdentifier(universalIdentifier),
      )
    ) {
      throw new ApplicationRegistrationException(
        `No listed marketplace application found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return detail;
  }
}
