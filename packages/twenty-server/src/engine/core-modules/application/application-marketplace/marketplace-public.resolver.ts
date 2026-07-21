import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
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
  async findManyPublicMarketplaceApps(
    @Args('isVetted', { type: () => Boolean, defaultValue: true })
    isVetted: boolean,
  ): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceQueryService.findManyMarketplaceApps({ isVetted });
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

    if (!detail.isListed) {
      throw new ApplicationRegistrationException(
        `No listed marketplace application found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return detail;
  }
}
