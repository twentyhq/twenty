import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';

import { AdminPanelWorkspaceBillingDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing.dto';
import { type AdminPanelWorkspaceUsageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
const CREDIT_BALANCE_MICRO_UNIT = 1_000_000;

const KNOWN_PLAN_KEYS: ReadonlySet<string> = new Set(
  Object.values(BillingPlanKey),
);

@Injectable()
export class AdminPanelBillingService {
  private readonly logger = new Logger(AdminPanelBillingService.name);

  constructor(
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getWorkspaceBilling(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingDTO | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const [customer, subscription] = await Promise.all([
      this.billingCustomerRepository.findOne(workspaceId, { where: {} }),
      this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      }),
    ]);

    if (!customer && !subscription) {
      return null;
    }

    const stripeCustomerId =
      customer?.stripeCustomerId ?? subscription?.stripeCustomerId ?? null;
    const creditBalance = customer
      ? customer.creditBalanceMicro / CREDIT_BALANCE_MICRO_UNIT
      : null;

    if (!subscription) {
      return {
        stripeCustomerId,
        creditBalance,
        subscription: null,
        usage: null,
      };
    }

    const usage = await this.getWorkspaceUsage(workspaceId);

    const items = subscription.billingSubscriptionItems ?? [];
    const priceIds = items.map((item) => item.stripePriceId);
    const prices = priceIds.length
      ? await this.billingPriceRepository.find({
          where: { stripePriceId: In(priceIds) },
        })
      : [];
    const priceByStripeId = new Map(
      prices.map((price) => [price.stripePriceId, price]),
    );

    const planValue = subscription.metadata?.plan;
    const planKey =
      typeof planValue === 'string' && KNOWN_PLAN_KEYS.has(planValue)
        ? planValue
        : null;

    return {
      stripeCustomerId,
      creditBalance,
      usage,
      subscription: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: subscription.status,
        interval: subscription.interval ?? null,
        currency: subscription.currency,
        planKey,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
        cancelAt: subscription.cancelAt,
        canceledAt: subscription.canceledAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        items: items.map((item) => {
          const price = priceByStripeId.get(item.stripePriceId);
          const firstTier = price?.tiers?.[0];
          const productKey = item.billingProduct?.metadata?.productKey;

          return {
            productName: item.billingProduct?.name ?? '',
            productKey: typeof productKey === 'string' ? productKey : null,
            stripePriceId: item.stripePriceId,
            quantity: item.quantity != null ? Number(item.quantity) : null,
            unitAmount:
              price?.unitAmount != null ? Number(price.unitAmount) : null,
            includedCredits:
              typeof firstTier?.up_to === 'number' ? firstTier.up_to : null,
          };
        }),
      },
    };
  }

  private async getWorkspaceUsage(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceUsageDTO | null> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return null;
    }

    try {
      const [usage] =
        await this.billingUsageService.getResourceCreditProductUsage(workspace);

      if (!usage) {
        return null;
      }

      const usedCredits = toDisplayCredits(usage.usedCredits);
      const grantedCredits = toDisplayCredits(usage.grantedCredits);
      const rolloverCredits = toDisplayCredits(usage.rolloverCredits);
      const totalGrantedCredits = toDisplayCredits(usage.totalGrantedCredits);

      return {
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        usedCredits,
        grantedCredits,
        rolloverCredits,
        totalGrantedCredits,
        remainingCredits: toDisplayCredits(
          usage.totalGrantedCredits - usage.usedCredits,
        ),
      };
    } catch (error) {
      this.logger.warn(
        `Failed to compute credit usage for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }
}
