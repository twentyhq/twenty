import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BillingSessionInput } from 'src/engine/core-modules/billing/dto/billing-session.input';
import { CheckoutSessionInput } from 'src/engine/core-modules/billing/dto/checkout-session.input';
import { PlansInformationDTO } from 'src/engine/core-modules/billing/dto/plans-information.dto';
import { ProductPricesDTO } from 'src/engine/core-modules/billing/dto/product-prices.dto';
import { ProductInput } from 'src/engine/core-modules/billing/dto/product.input';
import { SessionDTO } from 'src/engine/core-modules/billing/dto/session.dto';
import { UpdateBillingDTO } from 'src/engine/core-modules/billing/dto/update-billing.dto';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
    private readonly billingPlanService: BillingPlanService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Query(() => ProductPricesDTO)
  @UseGuards(WorkspaceAuthGuard)
  async getProductPrices(
    @AuthWorkspace() workspace: Workspace,
    @Args() { product }: ProductInput,
  ) {
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspace.id,
      );

    const productPrices = isBillingPlansEnabled
      ? await this.billingPlanService.getProductPrices()
      : await this.stripePriceService.getStripePrices(product);

    return {
      totalNumberOfPrices: productPrices.length,
      productPrices,
    };
  }

  @Query(() => SessionDTO)
  @UseGuards(WorkspaceAuthGuard)
  async billingPortalSession(
    @AuthWorkspace() workspace: Workspace,
    @Args() { returnUrlPath }: BillingSessionInput,
  ) {
    return {
      url: await this.billingPortalWorkspaceService.computeBillingPortalSessionURLOrThrow(
        workspace.id,
        returnUrlPath,
      ),
    };
  }

  @Mutation(() => SessionDTO)
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
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspace.id,
      );

    const productPrice = isBillingPlansEnabled
      ? (
          await this.billingPlanService.getProductPrices(
            plan,
            recurringInterval,
          )
        )?.[0]
      : await this.stripePriceService.getStripePrice(
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

  @Mutation(() => UpdateBillingDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateBillingSubscription(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.applyBillingSubscription(workspace);

    return { success: true };
  }

  @Query(() => PlansInformationDTO)
  // @UseGuards(WorkspaceAuthGuard) I don't need the workspace for this query should i add it anyways?
  async getAllPlansInformation() {
    return this.billingPlanService.getAllPlansInformation();
  }
}
