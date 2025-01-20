import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BillingSessionInput } from 'src/engine/core-modules/billing/dto/billing-session.input';
import { CheckoutSessionInput } from 'src/engine/core-modules/billing/dto/checkout-session.input';
import { ProductPricesEntity } from 'src/engine/core-modules/billing/dto/product-prices.entity';
import { ProductInput } from 'src/engine/core-modules/billing/dto/product.input';
import { SessionEntity } from 'src/engine/core-modules/billing/dto/session.entity';
import { UpdateBillingEntity } from 'src/engine/core-modules/billing/dto/update-billing.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
export class BillingResolver {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingPortalWorkspaceService: BillingPortalWorkspaceService,
    private readonly stripePriceService: StripePriceService,
  ) {}

  @Query(() => ProductPricesEntity)
  async getProductPrices(@Args() { product }: ProductInput) {
    const productPrices =
      await this.stripePriceService.getStripePrices(product);

    return {
      totalNumberOfPrices: productPrices.length,
      productPrices: productPrices,
    };
  }

  @Query(() => SessionEntity)
  @UseGuards(WorkspaceAuthGuard)
  async billingPortalSession(
    @AuthWorkspace() workspace: Workspace,
    @Args() { returnUrlPath }: BillingSessionInput,
  ) {
    return {
      url: await this.billingPortalWorkspaceService.computeBillingPortalSessionURLOrThrow(
        workspace,
        returnUrlPath,
      ),
    };
  }

  @Mutation(() => SessionEntity)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async checkoutSession(
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
    @Args()
    {
      recurringInterval,
      successUrlPath,
      plan,
      requirePaymentMethod,
    }: CheckoutSessionInput,
  ) {
    const productPrice = await this.stripePriceService.getStripePrice(
      AvailableProduct.BasePlan,
      recurringInterval,
    );

    if (!productPrice) {
      throw new Error(
        'Product price not found for the given recurring interval',
      );
    }

    return {
      url: await this.billingPortalWorkspaceService.computeCheckoutSessionURL(
        user,
        workspace,
        productPrice.stripePriceId,
        successUrlPath,
        plan,
        requirePaymentMethod,
      ),
    };
  }

  @Mutation(() => UpdateBillingEntity)
  @UseGuards(WorkspaceAuthGuard)
  async updateBillingSubscription(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.applyBillingSubscription(workspace);

    return { success: true };
  }
}
