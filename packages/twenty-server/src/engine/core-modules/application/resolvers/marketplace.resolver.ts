import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MarketplaceAppDTO } from 'src/engine/core-modules/application/dtos/marketplace-app.dto';
import { MarketplaceService } from 'src/engine/core-modules/application/services/marketplace.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class MarketplaceResolver {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Query(() => [MarketplaceAppDTO])
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceService.findAllMarketplaceApps();
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async installMarketplaceApp(): Promise<boolean> {
    // TODO
    return true;
  }
}
