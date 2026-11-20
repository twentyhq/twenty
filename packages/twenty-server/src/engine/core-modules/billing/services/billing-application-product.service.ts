/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { APPLICATION_PRICE_INTERVALS } from 'src/engine/core-modules/billing/constants/application-price-intervals.constant';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
import { type TargetApplicationProduct } from 'src/engine/core-modules/billing/types/target-application-product.type';
import { hasEveryIntervalPrice } from 'src/engine/core-modules/billing/utils/has-every-interval-price.util';
import { buildApplicationStripePriceParams } from 'src/engine/core-modules/billing/utils/build-application-stripe-price-params.util';
import { buildApplicationStripeProductId } from 'src/engine/core-modules/billing/utils/build-application-stripe-product-id.util';
import { buildBillingApplicationProductLockKey } from 'src/engine/core-modules/billing/utils/build-billing-application-product-lock-key.util';
import {
  collectDeclaredApplicationPrices,
  type DeclaredApplicationPrice,
} from 'src/engine/core-modules/billing/utils/collect-declared-application-prices.util';
import { computeApplicationPriceQuantity } from 'src/engine/core-modules/billing/utils/compute-application-price-quantity.util';
import { transformStripePriceToDatabasePrice } from 'src/engine/core-modules/billing/utils/transform-stripe-price-to-database-price.util';
import { transformStripeProductToDatabaseProduct } from 'src/engine/core-modules/billing/utils/transform-stripe-product-to-database-product.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class BillingApplicationProductService {
  protected readonly logger = new Logger(BillingApplicationProductService.name);

  constructor(
    private readonly stripeProductService: StripeProductService,
    private readonly stripePriceService: StripePriceService,
    private readonly cacheLockService: CacheLockService,
    private readonly billingSeatService: BillingSeatService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async findTargetApplicationProducts({
    workspaceId,
    subscribedStripeProductIds = [],
  }: {
    workspaceId: string;
    subscribedStripeProductIds?: string[];
  }): Promise<TargetApplicationProduct[]> {
    const declaredPrices = await this.findDeclaredPrices(workspaceId);

    if (!isNonEmptyArray(declaredPrices)) {
      return [];
    }

    const catalogEntries = await this.findCatalogEntries(declaredPrices);

    const workspaceMemberCount = declaredPrices.some(
      ({ price }) => price.per === 'WORKSPACE_MEMBER',
    )
      ? await this.billingSeatService.countWorkspaceMembers(workspaceId)
      : 0;

    const connectedAccountCountByApplicationId =
      await this.countConnectedAccountsByApplicationId({
        workspaceId,
        applicationIds: [
          ...new Set(
            declaredPrices
              .filter(({ price }) => price.per === 'CONNECTED_ACCOUNT')
              .map(({ applicationId }) => applicationId),
          ),
        ],
      });

    return catalogEntries.flatMap(
      ({ declaredPrice, stripeProductId, billingProduct }) => {
        if (!isDefined(billingProduct)) {
          if (subscribedStripeProductIds.includes(stripeProductId)) {
            throw new BillingException(
              `Application product ${stripeProductId} of workspace ${workspaceId} is on the subscription but its catalog entry is incomplete`,
              BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
            );
          }

          this.logger.warn(
            `Application price ${declaredPrice.price.universalIdentifier} of workspace ${workspaceId} has no catalog entry yet`,
          );

          return [];
        }

        const quantity = computeApplicationPriceQuantity({
          per: declaredPrice.price.per,
          workspaceMemberCount,
          connectedAccountCount:
            connectedAccountCountByApplicationId.get(
              declaredPrice.applicationId,
            ) ?? 0,
        });

        return quantity > 0 ? [{ billingProduct, quantity }] : [];
      },
    );
  }

  async createMissingProducts(workspaceId: string): Promise<void> {
    const declaredPrices = await this.findDeclaredPrices(workspaceId);

    if (!isNonEmptyArray(declaredPrices)) {
      return;
    }

    const catalogEntries = await this.findCatalogEntries(declaredPrices);

    for (const { declaredPrice, billingProduct } of catalogEntries) {
      if (!isDefined(billingProduct)) {
        await this.createProduct(declaredPrice);
      }
    }
  }

  async isApplicationPriceBillingEnabled(
    workspaceId: string,
  ): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return featureFlagsMap[FeatureFlagKey.IS_APPLICATION_PRICE_BILLING_ENABLED];
  }

  private async findDeclaredPrices(
    workspaceId: string,
  ): Promise<DeclaredApplicationPrice[]> {
    if (!(await this.isApplicationPriceBillingEnabled(workspaceId))) {
      return [];
    }

    const applications = await this.applicationRepository.find(workspaceId, {
      where: { version: Not(IsNull()) },
    });

    return collectDeclaredApplicationPrices({ applications });
  }

  private async countConnectedAccountsByApplicationId({
    workspaceId,
    applicationIds,
  }: {
    workspaceId: string;
    applicationIds: string[];
  }): Promise<Map<string, number>> {
    if (!isNonEmptyArray(applicationIds)) {
      return new Map();
    }

    const rows = await this.connectedAccountRepository
      .createQueryBuilder('connectedAccount')
      .select('connectedAccount.applicationId', 'applicationId')
      .addSelect('COUNT(*)', 'count')
      .where({
        workspaceId,
        applicationId: In(applicationIds),
        archivedAt: IsNull(),
      })
      .groupBy('connectedAccount.applicationId')
      .getRawMany<{ applicationId: string; count: string }>();

    return new Map(
      rows.map(({ applicationId, count }) => [applicationId, Number(count)]),
    );
  }

  private async findCatalogEntries(
    declaredPrices: DeclaredApplicationPrice[],
  ): Promise<
    {
      declaredPrice: DeclaredApplicationPrice;
      stripeProductId: string;
      billingProduct: BillingProductEntity | undefined;
    }[]
  > {
    const billingProducts = await this.billingProductRepository.find({
      where: {
        stripeProductId: In(
          declaredPrices.map(buildApplicationStripeProductId),
        ),
      },
      relations: ['billingPrices'],
    });

    return declaredPrices.map((declaredPrice) => {
      const stripeProductId = buildApplicationStripeProductId(declaredPrice);
      const billingProduct = billingProducts.find(
        (product) => product.stripeProductId === stripeProductId,
      );

      return {
        declaredPrice,
        stripeProductId,
        billingProduct: hasEveryIntervalPrice(billingProduct)
          ? billingProduct
          : undefined,
      };
    });
  }

  private async createProduct({
    applicationUniversalIdentifier,
    applicationName,
    price,
  }: DeclaredApplicationPrice): Promise<BillingProductEntity> {
    const stripeProductId = buildApplicationStripeProductId({
      applicationUniversalIdentifier,
      price,
    });

    return await this.cacheLockService.withLock(
      async () => {
        const stripeProduct =
          await this.stripeProductService.getOrCreateProduct({
            id: stripeProductId,
            name: `${applicationName} - ${price.label}`,
            description: price.description,
            metadata: {
              productKey: BillingProductKey.APPLICATION,
              priceUsageBased: BillingUsageType.LICENSED,
              applicationUniversalIdentifier,
              applicationPriceUniversalIdentifier: price.universalIdentifier,
            },
          });

        const existingStripePrices =
          await this.stripePriceService.getPricesByProductId(stripeProductId);

        const createdStripePrices = await Promise.all(
          APPLICATION_PRICE_INTERVALS.filter(
            (interval) =>
              !existingStripePrices.some(
                (stripePrice) =>
                  stripePrice.active &&
                  stripePrice.recurring?.interval === interval,
              ),
          ).map((interval) =>
            this.stripePriceService.createPrice(
              buildApplicationStripePriceParams({
                stripeProductId,
                price,
                interval,
              }),
            ),
          ),
        );

        await this.billingProductRepository.upsert(
          transformStripeProductToDatabaseProduct(stripeProduct),
          { conflictPaths: ['stripeProductId'] },
        );

        await this.billingPriceRepository.upsert(
          [...existingStripePrices, ...createdStripePrices].map(
            transformStripePriceToDatabasePrice,
          ),
          { conflictPaths: ['stripePriceId'] },
        );

        return await this.billingProductRepository.findOneOrFail({
          where: { stripeProductId },
          relations: ['billingPrices'],
        });
      },
      buildBillingApplicationProductLockKey(stripeProductId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }
}
