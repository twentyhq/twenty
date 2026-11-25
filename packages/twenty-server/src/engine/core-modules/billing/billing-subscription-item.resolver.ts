/* @license Enterprise */

import { UseFilters, UsePipes, UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationBillingPriceUnitEnum } from 'src/engine/core-modules/application/dtos/application-billing-price-unit.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildApplicationLogoUrl } from 'src/engine/core-modules/application/utils/build-application-logo-url.util';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-item.dto';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@MetadataResolver(() => BillingSubscriptionItemDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionItemResolver {
  constructor(
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainServerConfigService: DomainServerConfigService,
  ) {}

  // Not the catalog: superseded prices keep billing existing workspaces and leave the catalog once archived
  @ResolveField(() => Number, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async unitAmount(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<number | null> {
    const billingPrice = await this.findItemPrice(billingSubscriptionItem);

    if (!isDefined(billingPrice?.unitAmount)) {
      return null;
    }

    const unitAmount = Number(billingPrice.unitAmount);

    return Number.isFinite(unitAmount) ? unitAmount : null;
  }

  @ResolveField(() => Number, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async creditAmount(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<number | null> {
    const billingPrice = await this.findItemPrice(billingSubscriptionItem);

    if (!isDefined(billingPrice?.metadata?.credit_amount)) {
      return null;
    }

    const creditAmount = toDisplayCredits(
      Number(billingPrice.metadata.credit_amount),
    );

    return Number.isFinite(creditAmount) ? creditAmount : null;
  }

  @ResolveField(() => String, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async applicationName(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    const application = await this.findInstalledApplication({
      billingSubscriptionItem,
      workspaceId: workspace.id,
    });

    return application?.name ?? null;
  }

  @ResolveField(() => String, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async applicationLogoUrl(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    const application = await this.findInstalledApplication({
      billingSubscriptionItem,
      workspaceId: workspace.id,
    });

    if (!isDefined(application)) {
      return null;
    }

    return buildApplicationLogoUrl({
      application,
      workspaceId: workspace.id,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      frontBaseUrl: this.domainServerConfigService.getBaseUrl().toString(),
    });
  }

  @ResolveField(() => ApplicationBillingPriceUnitEnum, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async applicationPricePer(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    const application = await this.findInstalledApplication({
      billingSubscriptionItem,
      workspaceId: workspace.id,
    });

    return (
      application?.acceptedBillingPrices?.find(
        (price) =>
          price.universalIdentifier ===
          billingSubscriptionItem.billingProduct?.metadata
            .applicationPriceUniversalIdentifier,
      )?.per ?? null
    );
  }

  private async findInstalledApplication({
    billingSubscriptionItem,
    workspaceId,
  }: {
    billingSubscriptionItem: Pick<
      BillingSubscriptionItemEntity,
      'billingProduct'
    >;
    workspaceId: string;
  }): Promise<FlatApplication | null> {
    const applicationUniversalIdentifier =
      billingSubscriptionItem.billingProduct?.metadata
        .applicationUniversalIdentifier;

    if (!isDefined(applicationUniversalIdentifier)) {
      return null;
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const applicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        applicationUniversalIdentifier
      ];

    return isDefined(applicationId)
      ? (flatApplicationMaps.byId[applicationId] ?? null)
      : null;
  }

  // currentWorkspace preloads product prices so app boot resolves in memory; other callers load no relations and need the query
  private async findItemPrice(
    billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<BillingPriceEntity | null> {
    const preloadedPrice =
      billingSubscriptionItem.billingProduct?.billingPrices?.find(
        (billingPrice) =>
          billingPrice.stripePriceId === billingSubscriptionItem.stripePriceId,
      );

    return (
      preloadedPrice ??
      (await this.billingPriceRepository.findOne({
        where: { stripePriceId: billingSubscriptionItem.stripePriceId },
      }))
    );
  }
}
