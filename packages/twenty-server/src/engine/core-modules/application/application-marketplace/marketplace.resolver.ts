import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UseFilters(ApplicationRegistrationExceptionFilter)
@UseGuards(
  UserAuthGuard,
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  NoPermissionGuard,
)
export class MarketplaceResolver {
  constructor(
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly applicationInstallService: ApplicationInstallService,
  ) {}

  @Query(() => [MarketplaceAppDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceQueryService.findManyMarketplaceApps();
  }

  @Query(() => MarketplaceAppDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findOneMarketplaceApp(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<MarketplaceAppDTO> {
    return this.marketplaceQueryService.findOneMarketplaceApp(
      universalIdentifier,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async installMarketplaceApp(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    return this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      version,
      workspaceId: workspace.id,
    });
  }
}
