/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

type WorkflowPriceInfo = {
  planKey: BillingPlanKey;
  interval: SubscriptionInterval;
  creditAmount: number | null;
};

@RegisteredWorkspaceCommand('2.4.0', 1797000001000)
@Command({
  name: 'upgrade:2-4:migrate-to-billing-v2',
  description:
    'Swap WORKFLOW_NODE_EXECUTION subscription items to RESOURCE_CREDIT for all V1 workspaces',
})
export class MigrateToBillingV2Command extends ActiveOrSuspendedWorkspaceCommandRunner {
  // Populated on first workspace, reused for all subsequent workspaces
  private catalogLoaded = false;
  private workflowPriceMap = new Map<string, WorkflowPriceInfo>();
  private resourceCreditBuckets = new Map<string, BillingPriceEntity[]>();
  private basePriceMap = new Map<string, string>();

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly billingService: BillingService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingSubscriptionPhaseService: BillingSubscriptionPhaseService,
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!this.billingService.isBillingEnabled()) {
      this.logger.log('Billing is not enabled, skipping');

      return;
    }

    if (!this.catalogLoaded) {
      await this.loadCatalog();
      this.catalogLoaded = true;
    }

    const isDryRun = options.dryRun ?? false;

    const isAlreadyV2 = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_BILLING_V2_ENABLED,
      workspaceId,
    );

    if (isAlreadyV2) {
      this.logger.log(
        `Workspace ${workspaceId} already on billing V2, skipping`,
      );

      return;
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (!isDefined(subscription)) {
      this.logger.log(
        `Workspace ${workspaceId} has no active subscription, skipping`,
      );

      return;
    }

    const workflowItem = subscription.billingSubscriptionItems.find(
      (item) =>
        item.billingProduct?.metadata.productKey ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!isDefined(workflowItem)) {
      this.logger.log(
        `Workspace ${workspaceId} has no WORKFLOW_NODE_EXECUTION item, skipping`,
      );

      return;
    }

    const baseItem = subscription.billingSubscriptionItems.find(
      (item) =>
        item.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
    );

    if (!isDefined(baseItem)) {
      throw new BillingException(
        `Workspace ${workspaceId} has no BASE_PRODUCT item`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const workflowPriceInfo = this.workflowPriceMap.get(
      workflowItem.stripePriceId,
    );

    if (!isDefined(workflowPriceInfo)) {
      throw new BillingException(
        `Workspace ${workspaceId} workflow price ${workflowItem.stripePriceId} not in catalog`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    const planIntervalKey = `${workflowPriceInfo.planKey}:${workflowPriceInfo.interval}`;
    const resourceCreditBucket =
      this.resourceCreditBuckets.get(planIntervalKey);

    if (!isDefined(resourceCreditBucket) || resourceCreditBucket.length === 0) {
      throw new BillingException(
        `Workspace ${workspaceId} no RESOURCE_CREDIT prices for ${planIntervalKey}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    const targetResourceCreditPrice = this.resolveClosestResourceCreditPrice(
      workflowPriceInfo.creditAmount,
      resourceCreditBucket,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] workspace=${workspaceId} creditAmount=${workflowPriceInfo.creditAmount ?? 'n/a'} ` +
          `swap ${workflowItem.stripeSubscriptionItemId}/${workflowItem.stripePriceId} → ${targetResourceCreditPrice.stripePriceId}`,
      );

      if (subscription.phases?.length > 0) {
        this.logger.log(
          `[DRY RUN] workspace=${workspaceId} has ${subscription.phases.length} phase(s) that would be updated`,
        );
      }

      return;
    }

    await this.stripeSubscriptionService.updateSubscription(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: baseItem.stripeSubscriptionItemId,
            price: baseItem.stripePriceId,
            quantity: baseItem.quantity ?? 1,
          },
          // Stripe forbids changing usage_type in-place (metered → licensed),
          // so we delete the old metered item and add the new licensed one.
          {
            id: workflowItem.stripeSubscriptionItemId,
            deleted: true,
          },
          {
            price: targetResourceCreditPrice.stripePriceId,
            quantity: 1,
          },
        ],
        proration_behavior: 'none',
      },
    );

    if (subscription.phases?.length > 0) {
      await this.migrateSubscriptionSchedulePhases({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        workspaceId,
      });
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_BILLING_V2_ENABLED],
      workspaceId,
    );

    this.logger.log(`Workspace ${workspaceId} migrated to billing V2`);
  }

  private async loadCatalog(): Promise<void> {
    const prices = await this.billingPriceRepository.find({
      where: { active: true },
      relations: ['billingProduct'],
    });

    for (const price of prices) {
      if (!isDefined(price.billingProduct)) continue;

      const { productKey, planKey } = price.billingProduct.metadata;

      if (!isDefined(planKey) || !isDefined(price.interval)) continue;

      const planIntervalKey = `${planKey}:${price.interval}`;

      if (productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION) {
        const creditAmount = isDefined(price.metadata?.credit_amount)
          ? Number(price.metadata.credit_amount)
          : isDefined(price.tiers?.[0]?.up_to)
            ? Number(price.tiers![0].up_to)
            : null;

        this.workflowPriceMap.set(price.stripePriceId, {
          planKey,
          interval: price.interval,
          creditAmount,
        });
      } else if (productKey === BillingProductKey.BASE_PRODUCT) {
        this.basePriceMap.set(planIntervalKey, price.stripePriceId);
      } else if (productKey === BillingProductKey.RESOURCE_CREDIT) {
        if (!this.resourceCreditBuckets.has(planIntervalKey)) {
          this.resourceCreditBuckets.set(planIntervalKey, []);
        }
        this.resourceCreditBuckets.get(planIntervalKey)!.push(price);
      }
    }

    for (const [key, bucket] of this.resourceCreditBuckets.entries()) {
      this.resourceCreditBuckets.set(
        key,
        bucket.sort(
          (a, b) =>
            Number(a.metadata?.credit_amount ?? 0) -
            Number(b.metadata?.credit_amount ?? 0),
        ),
      );
    }

    this.logger.log(
      `Catalog loaded: ${this.workflowPriceMap.size} workflow prices, ` +
        `${this.resourceCreditBuckets.size} RESOURCE_CREDIT buckets, ` +
        `${this.basePriceMap.size} base prices`,
    );
  }

  // Finds the RESOURCE_CREDIT price whose credit_amount is closest to the
  // reference credit amount. Falls back to the lowest bucket entry when
  // the reference amount is unknown.
  private resolveClosestResourceCreditPrice(
    referenceCreditAmount: number | null,
    bucket: BillingPriceEntity[],
  ): BillingPriceEntity {
    if (!isDefined(referenceCreditAmount)) {
      return bucket[0];
    }

    return bucket.reduce((best, candidate) => {
      const bestDelta = Math.abs(
        referenceCreditAmount - Number(best.metadata?.credit_amount ?? 0),
      );
      const candidateDelta = Math.abs(
        referenceCreditAmount - Number(candidate.metadata?.credit_amount ?? 0),
      );

      return candidateDelta < bestDelta ? candidate : best;
    }, bucket[0]);
  }

  // Releases the existing schedule then recreates it with the future phases
  // translated to RESOURCE_CREDIT prices. Each future phase is resolved
  // independently to handle plan/interval changes across phases.
  private async migrateSubscriptionSchedulePhases({
    stripeSubscriptionId,
    workspaceId,
  }: {
    stripeSubscriptionId: string;
    workspaceId: string;
  }): Promise<void> {
    const subscriptionWithSchedule =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );

    const schedule = subscriptionWithSchedule.schedule;

    if (!isDefined(schedule) || typeof schedule === 'string') {
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const futurePhases = schedule.phases.filter(
      (phase) => (phase.start_date ?? 0) > nowSeconds,
    );

    // Release the old schedule — the subscription items are already correct
    // from the stripe.subscriptions.update call above.
    await this.stripeSubscriptionScheduleService.releaseSubscriptionSchedule(
      schedule.id,
    );

    this.logger.log(
      `workspace=${workspaceId} old schedule=${schedule.id} released`,
    );

    if (futurePhases.length === 0) {
      return;
    }

    // Recreate a fresh schedule from the updated subscription, then attach
    // the migrated future phases to it.
    const { schedule: newSchedule, currentPhase } =
      await this.stripeSubscriptionScheduleService.createSubscriptionSchedule(
        stripeSubscriptionId,
      );

    if (futurePhases.length > 1) {
      this.logger.warn(
        `workspace=${workspaceId} new schedule=${newSchedule.id} — ` +
          `${futurePhases.length} future phases found; only the first will be migrated`,
      );
    }

    const nextPhase = futurePhases[0];
    const nextPhaseParams =
      this.billingSubscriptionPhaseService.toPhaseUpdateParams(nextPhase);

    const { price: phaseLicensedPriceId, quantity: phaseSeats } =
      this.billingSubscriptionPhaseService.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(
        nextPhaseParams,
      );

    const phaseWorkflowPriceId = nextPhase.items
      .map((item: Stripe.SubscriptionSchedule.Phase.Item) =>
        typeof item.price === 'string' ? item.price : item.price.id,
      )
      .find((priceId) => this.workflowPriceMap.has(priceId));

    if (!isDefined(phaseWorkflowPriceId)) {
      this.logger.warn(
        `workspace=${workspaceId} new schedule=${newSchedule.id} — ` +
          `no WORKFLOW_NODE_EXECUTION price in future phase, skipping`,
      );

      return;
    }

    const phaseWorkflowInfo = this.workflowPriceMap.get(phaseWorkflowPriceId)!;
    const phasePlanIntervalKey = `${phaseWorkflowInfo.planKey}:${phaseWorkflowInfo.interval}`;
    const phaseBucket = this.resourceCreditBuckets.get(phasePlanIntervalKey);

    if (!isDefined(phaseBucket) || phaseBucket.length === 0) {
      this.logger.warn(
        `workspace=${workspaceId} new schedule=${newSchedule.id} — ` +
          `no RESOURCE_CREDIT prices for ${phasePlanIntervalKey}, skipping`,
      );

      return;
    }

    const phaseResourceCreditPriceId = this.resolveClosestResourceCreditPrice(
      phaseWorkflowInfo.creditAmount,
      phaseBucket,
    ).stripePriceId;

    await this.billingSubscriptionUpdateService.runSubscriptionScheduleUpdate({
      stripeScheduleId: newSchedule.id,
      toUpdateCurrentPrices: undefined,
      toUpdateNextPrices: {
        licensedPriceId: phaseLicensedPriceId,
        seats: phaseSeats,
        meteredPriceId: undefined,
        resourceCreditPriceId: phaseResourceCreditPriceId,
      },
      currentPhase:
        this.billingSubscriptionPhaseService.toPhaseUpdateParams(currentPhase),
      subscriptionCurrentPeriodEnd: nextPhase.start_date,
      isV2: true,
    });

    this.logger.log(
      `workspace=${workspaceId} new schedule=${newSchedule.id} — future phase migrated`,
    );
  }
}
