/* @license Enterprise */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingProductInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-product.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { BillingProductPricesOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-product-prices.output';
import { BillingSessionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-session.output';
import { BillingUpdateOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-update.output';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
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

  @Query(() => BillingProductPricesOutput)
  @UseGuards(WorkspaceAuthGuard)
  async getProductPrices(
    @AuthWorkspace() workspace: Workspace,
    @Args() { product }: BillingProductInput,
  ) {
    const productPrices =
      await this.stripePriceService.getStripePrices(product);

    return {
      totalNumberOfPrices: productPrices.length,
      productPrices,
    };
  }

  @Query(() => BillingSessionOutput)
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

  @Mutation(() => BillingSessionOutput)
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
    }: BillingCheckoutSessionInput,
  ) {
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspace.id,
      );

    const checkoutSessionParams: BillingPortalCheckoutSessionParameters = {
      user,
      workspace,
      successUrlPath,
      plan: plan ?? BillingPlanKey.PRO,
      requirePaymentMethod,
    };

    if (isBillingPlansEnabled) {
      const billingPricesPerPlan =
        await this.billingPlanService.getPricesPerPlan({
          planKey: checkoutSessionParams.plan,
          interval: recurringInterval,
        });
      const checkoutSessionURL =
        await this.billingPortalWorkspaceService.computeCheckoutSessionURL({
          ...checkoutSessionParams,
          billingPricesPerPlan,
        });

      return {
        url: checkoutSessionURL,
      };
    }

    const productPrice = await this.stripePriceService.getStripePrice(
      AvailableProduct.BasePlan,
      recurringInterval,
    );

    if (!productPrice) {
      throw new GraphQLError(
        'Product price not found for the given recurring interval',
      );
    }
    const checkoutSessionURL =
      await this.billingPortalWorkspaceService.computeCheckoutSessionURL({
        ...checkoutSessionParams,
        priceId: productPrice.stripePriceId,
      });

    return {
      url: checkoutSessionURL,
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(WorkspaceAuthGuard)
  async updateBillingSubscription(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.applyBillingSubscription(workspace);

    return { success: true };
  }

  @Query(() => [BillingPlanOutput])
  @UseGuards(WorkspaceAuthGuard)
  async plans(): Promise<BillingPlanOutput[]> {
    const plans = await this.billingPlanService.getPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }
}
