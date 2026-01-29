import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { MarketplaceService } from './marketplace.service';

import { MarketplaceAppDTO } from './dtos/marketplace-app.dto';

@Resolver()
@UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class MarketplaceResolver {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Query(() => [MarketplaceAppDTO])
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceService.findAllMarketplaceApps();
  }

  @Query(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async installMarketplaceApp(): Promise<boolean> {
    // To implement
    return true;
  }
}
