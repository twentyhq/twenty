import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { PlanInformationDTO } from 'src/engine/core-modules/billing/dto/plan-information.dto';
import { PlansInformationDTO } from 'src/engine/core-modules/billing/dto/plans-information.dto';
import { PriceLicensedDTO } from 'src/engine/core-modules/billing/dto/price-licensed.dto';
import { PriceMeteredDTO } from 'src/engine/core-modules/billing/dto/price-metered.dto';
import { ProductPriceDTO } from 'src/engine/core-modules/billing/dto/product-price.dto';
import { ProductDTO } from 'src/engine/core-modules/billing/dto/product.dto';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
@Injectable()
export class BillingPlanService {
  protected readonly logger = new Logger(BillingPlanService.name);
  constructor(
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
  ) {}

  async getProductsByProductMetadata(
    planKey: BillingPlanKey,
    priceUsageBased: BillingUsageType,
    isBaseProduct: 'true' | 'false',
  ): Promise<BillingProduct[]> {
    const products = await this.billingProductRepository.find({
      where: {
        metadata: {
          planKey,
          priceUsageBased,
          isBaseProduct,
        },
        active: true,
      },
    });

    return products;
  }

  async getAllPlansInformation(): Promise<PlansInformationDTO> {
    const planKeys = Object.values(BillingPlanKey);

    const plans = await Promise.all(
      planKeys.map(async (planKey) => {
        return await this.getPlanInformationByKey(planKey);
      }),
    );

    return {
      plans,
    };
  }

  async getPlanInformationByKey(
    planKey: BillingPlanKey,
  ): Promise<PlanInformationDTO> {
    const baseProduct = await this.getBaseProductByKey(planKey);
    const otherLicensedProducts =
      await this.getOtherLicensedProductsByKey(planKey);
    const meteredProducts = await this.getMeteredProductsByKey(planKey);

    return {
      planKey,
      baseProduct,
      otherLicensedProducts,
      meteredProducts,
    };
  }

  async getBaseProductByKey(planKey: BillingPlanKey): Promise<ProductDTO> {
    const baseBillingProduct = await this.getProductsByProductMetadata(
      planKey,
      BillingUsageType.LICENSED,
      'true',
    );

    if (baseBillingProduct?.length === 0) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    return await this.getProductDTOfromBillingProduct(
      baseBillingProduct[0],
      BillingUsageType.LICENSED,
    );
  }

  async getOtherLicensedProductsByKey(
    planKey: BillingPlanKey,
  ): Promise<ProductDTO[]> {
    const otherLicensedBillingProducts =
      await this.getProductsByProductMetadata(
        planKey,
        BillingUsageType.LICENSED,
        'false',
      );

    if (otherLicensedBillingProducts?.length === 0) {
      return [];
    }

    return await Promise.all(
      otherLicensedBillingProducts.map((product) =>
        this.getProductDTOfromBillingProduct(
          product,
          BillingUsageType.LICENSED,
        ),
      ),
    );
  }

  async getMeteredProductsByKey(
    planKey: BillingPlanKey,
  ): Promise<ProductDTO[]> {
    const meteredBillingProducts = await this.getProductsByProductMetadata(
      planKey,
      BillingUsageType.METERED,
      'false',
    );

    if (meteredBillingProducts?.length === 0) {
      return [];
    }

    return await Promise.all(
      meteredBillingProducts.map((product) =>
        this.getProductDTOfromBillingProduct(product, BillingUsageType.METERED),
      ),
    );
  }

  async getProductPrices(
    planKey: BillingPlanKey = BillingPlanKey.PRO,
    interval?: SubscriptionInterval,
  ): Promise<ProductPriceDTO[]> {
    const baseBillingProduct = await this.getProductsByProductMetadata(
      planKey,
      BillingUsageType.LICENSED,
      'true',
    );

    if (baseBillingProduct?.length === 0) {
      throw new Error('Base product not found');
    }

    const prices = await this.billingPriceRepository.find({
      where: {
        stripeProductId: baseBillingProduct[0].stripeProductId,
        active: true,
        ...(interval && { interval }),
      },
    });

    return this.formatBillingPriceDataToProductPriceDTO(prices);
  }

  async getProductDTOfromBillingProduct(
    product: BillingProduct,
    priceUsageBased: BillingUsageType,
  ): Promise<ProductDTO> {
    const billingPrices = await this.billingPriceRepository
      .createQueryBuilder('price')
      .where('price.stripeProductId = :stripeProductId', {
        stripeProductId: product.stripeProductId,
      })
      .andWhere('price.active = :active', { active: true })
      .orderBy('price.interval')
      .addOrderBy('price.createdAt', 'DESC')
      .distinctOn(['price.interval'])
      .getMany();
    const prices = await this.formatToPricesDTO(billingPrices, priceUsageBased);

    return {
      description: product?.description ?? '',
      images: product?.images ?? [],
      prices,
      name: product?.name ?? '',
      type: priceUsageBased,
    };
  }

  formatToPricesDTO(
    billingPrices: BillingPrice[],
    priceUsageBased: BillingUsageType,
  ): PriceLicensedDTO[] | PriceMeteredDTO[] {
    switch (priceUsageBased) {
      case BillingUsageType.LICENSED:
        return billingPrices.map((price) =>
          this.formatBillingPriceDataToLicensedPriceDTO(price),
        );
      case BillingUsageType.METERED:
        return billingPrices.map((price) =>
          this.formatBillingPriceDataToMeteredPriceDTO(price),
        );
    }
  }

  formatBillingPriceDataToLicensedPriceDTO(
    billingPrice: BillingPrice,
  ): PriceLicensedDTO {
    return {
      recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
      unitAmount: billingPrice?.unitAmount ?? 0,
    };
  }

  formatBillingPriceDataToMeteredPriceDTO(
    billingPrice: BillingPrice,
  ): PriceMeteredDTO {
    return {
      tiersMode:
        billingPrice?.tiersMode === BillingPriceTiersMode.GRADUATED
          ? BillingPriceTiersMode.GRADUATED
          : null,
      tiers:
        billingPrice?.tiers?.map((tier) => ({
          upTo: tier.up_to,
          flatAmount: tier.flat_amount,
          unitAmount: tier.unit_amount,
        })) ?? [],
      recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    };
  }

  formatBillingPriceDataToProductPriceDTO(
    prices: BillingPrice[],
  ): ProductPriceDTO[] {
    const productPrices: ProductPriceDTO[] = Object.values(
      prices
        .filter((item) => item.recurring?.interval && item.unitAmount)
        .reduce((acc, item: BillingPrice) => {
          const interval = item.recurring?.interval;

          if (!interval || !item.unitAmount) {
            return acc;
          }

          if (!acc[interval] || item.createdAt > acc[interval].createdAt) {
            acc[interval] = {
              unitAmount: item.unitAmount,
              recurringInterval: interval,
              created: item.createdAt,
              stripePriceId: item.stripePriceId,
            };
          }

          return acc satisfies Record<string, ProductPriceDTO>;
        }, {}),
    );

    return productPrices.sort((a, b) => a.unitAmount - b.unitAmount);
  }
}
