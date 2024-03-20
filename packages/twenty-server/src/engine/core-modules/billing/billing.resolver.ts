import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
  AvailableProduct,
  BillingService,
} from 'src/engine/core-modules/billing/billing.service';
import { ProductInput } from 'src/engine/core-modules/billing/dto/product.input';
import { assert } from 'src/utils/assert';
import { ProductPricesEntity } from 'src/engine/core-modules/billing/dto/product-prices.entity';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { CheckoutSessionInput } from 'src/engine/core-modules/billing/dto/checkout-session.input';
import { SessionEntity } from 'src/engine/core-modules/billing/dto/session.entity';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dto/billing-session.input';
import { UpdateBillingEntity } from 'src/engine/core-modules/billing/dto/update-billing.entity';

@Resolver()
export class BillingResolver {
  constructor(private readonly billingService: BillingService) {}

  @Query(() => ProductPricesEntity)
  async getProductPrices(@Args() { product }: ProductInput) {
    const stripeProductId = this.billingService.getProductStripeId(product);

    assert(
      stripeProductId,
      `Product '${product}' not found, available products are ['${Object.values(
        AvailableProduct,
      ).join("','")}']`,
    );

    const productPrices =
      await this.billingService.getProductPrices(stripeProductId);

    return {
      totalNumberOfPrices: productPrices.length,
      productPrices: productPrices,
    };
  }

  @Query(() => SessionEntity)
  @UseGuards(JwtAuthGuard)
  async billingPortalSession(
    @AuthUser() user: User,
    @Args() { returnUrlPath }: BillingSessionInput,
  ) {
    return {
      url: await this.billingService.computeBillingPortalSessionURL(
        user.defaultWorkspaceId,
        returnUrlPath,
      ),
    };
  }

  @Mutation(() => SessionEntity)
  @UseGuards(JwtAuthGuard)
  async checkoutSession(
    @AuthUser() user: User,
    @Args() { recurringInterval, successUrlPath }: CheckoutSessionInput,
  ) {
    const stripeProductId = this.billingService.getProductStripeId(
      AvailableProduct.BasePlan,
    );

    assert(
      stripeProductId,
      'BasePlan productId not found, please check your BILLING_STRIPE_BASE_PLAN_PRODUCT_ID env variable',
    );

    const productPrices =
      await this.billingService.getProductPrices(stripeProductId);

    const stripePriceId = productPrices.filter(
      (price) => price.recurringInterval === recurringInterval,
    )?.[0]?.stripePriceId;

    assert(
      stripePriceId,
      `BasePlan priceId not found, please check body.recurringInterval and product '${AvailableProduct.BasePlan}' prices`,
    );

    return {
      url: await this.billingService.computeCheckoutSessionURL(
        user,
        stripePriceId,
        successUrlPath,
      ),
    };
  }

  @Mutation(() => UpdateBillingEntity)
  @UseGuards(JwtAuthGuard)
  async updateBillingSubscription(@AuthUser() user: User) {
    await this.billingService.updateBillingSubscription(user);

    return { success: true };
  }
}
