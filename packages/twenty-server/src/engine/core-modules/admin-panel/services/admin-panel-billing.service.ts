import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { AdminPanelWorkspaceBillingDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing.dto';
import { type AdminPanelWorkspaceCreditGrantDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-credit-grant.dto';
import { type AdminPanelWorkspaceUsageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage.dto';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
  toDisplayCredits,
} from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
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
    private readonly billingCreditService: BillingCreditService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async grantWorkspaceCredits({
    workspaceId,
    amount,
    type,
    reason,
    grantedByUserId,
  }: {
    workspaceId: string;
    amount: number;
    type: BillingCreditGrantType;
    reason?: string;
    grantedByUserId: string;
  }): Promise<AdminPanelWorkspaceCreditGrantDTO> {
    const amountMicro = Math.round(
      amount * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );

    const maxAmountMicro = this.twentyConfigService.get(
      'BILLING_MAX_ADMIN_CREDIT_GRANT_MICRO',
    );

    // The field is micro-denominated, so a slipped decimal is four orders of
    // magnitude. Bound what a single grant can hand out.
    if (amountMicro > maxAmountMicro) {
      throw new BillingException(
        `Cannot grant ${toDisplayCredits(amountMicro)} credits at once, the maximum is ${toDisplayCredits(maxAmountMicro)}`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    const grant = await this.billingCreditService.grantCredits({
      workspaceId,
      amountMicro,
      type,
      reason,
      grantedByUserId,
    });

    if (!isDefined(grant)) {
      throw new BillingException(
        `Could not grant credits to workspace ${workspaceId}, billing is disabled on this instance`,
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    return this.toCreditGrantDTO(grant);
  }

  async revokeWorkspaceCreditGrant({
    workspaceId,
    creditGrantId,
    revokedByUserId,
  }: {
    workspaceId: string;
    creditGrantId: string;
    revokedByUserId: string;
  }): Promise<AdminPanelWorkspaceCreditGrantDTO> {
    const grant = await this.billingCreditService.revokeGrant({
      workspaceId,
      grantId: creditGrantId,
      revokedByUserId,
    });

    return this.toCreditGrantDTO(grant);
  }

  private async getWorkspaceCreditGrants(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceCreditGrantDTO[]> {
    const grants = await this.billingCreditGrantService.listGrants(workspaceId);

    return grants.map((grant) => this.toCreditGrantDTO(grant));
  }

  private toCreditGrantDTO(
    grant: BillingCreditGrantEntity,
  ): AdminPanelWorkspaceCreditGrantDTO {
    const now = Date.now();

    return {
      id: grant.id,
      amount: toDisplayCredits(grant.amountMicro),
      type: grant.type,
      effectiveAt: grant.effectiveAt,
      expiresAt: grant.expiresAt,
      revokedAt: grant.revokedAt,
      reason: grant.reason,
      isActive:
        !isDefined(grant.revokedAt) &&
        grant.effectiveAt.getTime() <= now &&
        grant.expiresAt.getTime() > now,
      createdAt: grant.createdAt,
    };
  }

  async getWorkspaceBilling(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingDTO | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const [customer, subscription, creditGrants] = await Promise.all([
      this.billingCustomerRepository.findOne(workspaceId, { where: {} }),
      this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      }),
      this.getWorkspaceCreditGrants(workspaceId),
    ]);

    // A workspace can hold granted credits before it has a customer or a
    // subscription, and the admin panel still has to show and manage them.
    if (!customer && !subscription && creditGrants.length === 0) {
      return null;
    }

    const stripeCustomerId =
      customer?.stripeCustomerId ?? subscription?.stripeCustomerId ?? null;
    const creditBalance = toDisplayCredits(
      await this.billingCreditGrantService.getSpendableCreditsMicro(
        workspaceId,
      ),
    );

    if (!subscription) {
      return {
        stripeCustomerId,
        creditBalance,
        creditGrants,
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
      creditGrants,
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
        remainingCredits: totalGrantedCredits - usedCredits,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to compute credit usage for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }
}
