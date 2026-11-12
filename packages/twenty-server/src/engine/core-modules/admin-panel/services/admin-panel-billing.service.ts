import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { type AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { AdminPanelWorkspaceBillingDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing.dto';
import { type AdminPanelWorkspaceCreditGrantDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-credit-grant.dto';
import { type AdminPanelWorkspaceUsageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage.dto';
import { type CreateWorkspaceBillingArrangementInput } from 'src/engine/core-modules/admin-panel/dtos/create-workspace-billing-arrangement.input';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import {
  ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES,
  BillingArrangementType,
} from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import {
  ADMIN_GRANTABLE_CREDIT_GRANT_TYPES,
  type BillingCreditGrantType,
} from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-retry-options.constant';
import {
  UpdateSubscriptionQuantityJob,
  type UpdateSubscriptionQuantityJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { buildBillingSeatLockKey } from 'src/engine/core-modules/billing/utils/build-billing-seat-lock-key.util';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { getBillingArrangementStatus } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-status.util';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
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
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly billingMessageQueueService: MessageQueueService,
    private readonly billingArrangementService: BillingArrangementService,
    private readonly billingSeatService: BillingSeatService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingUsageService: BillingUsageService,
    private readonly billingCreditService: BillingCreditService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async grantWorkspaceCredits({
    workspaceId,
    amount,
    type,
    reason,
    expiresInDays,
    clientOperationId,
    grantedByUserId,
  }: {
    workspaceId: string;
    amount: number;
    type: BillingCreditGrantType;
    reason?: string;
    expiresInDays?: number;
    clientOperationId: string;
    grantedByUserId: string;
  }): Promise<AdminPanelWorkspaceCreditGrantDTO> {
    // The mutation is reachable directly, not only through the admin panel picker; see ADMIN_GRANTABLE_CREDIT_GRANT_TYPES for the exclusions
    if (!ADMIN_GRANTABLE_CREDIT_GRANT_TYPES.includes(type)) {
      throw new BillingException(
        `Cannot grant credits of type ${type} by hand`,
        BillingExceptionCode.BILLING_CREDIT_GRANT_TYPE_NOT_GRANTABLE,
      );
    }

    const amountMicro = Math.round(
      amount * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );

    const maxAmountMicro = this.twentyConfigService.get(
      'BILLING_MAX_ADMIN_CREDIT_GRANT_MICRO',
    );

    // A slipped decimal on a micro-denominated amount is four orders of magnitude
    if (amountMicro > maxAmountMicro) {
      throw new BillingException(
        `Cannot grant ${toDisplayCredits(amountMicro)} credits at once, the maximum is ${toDisplayCredits(maxAmountMicro)}`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    const idempotencyKey = buildAdminGrantIdempotencyKey(clientOperationId);

    const grant = await this.billingCreditService.grantCredits({
      workspaceId,
      amountMicro,
      type,
      reason,
      expiresInDays,
      idempotencyKey,
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

  async createWorkspaceBillingArrangement({
    input: {
      workspaceId,
      type,
      label,
      comment,
      endsAt,
      seats,
      seatCapMode,
      creditAllowance,
    },
    grantedByUserId,
  }: {
    input: CreateWorkspaceBillingArrangementInput;
    grantedByUserId: string;
  }): Promise<AdminPanelWorkspaceBillingArrangementDTO> {
    this.assertBillingArrangementIsManageable(type);

    const trimmedComment = comment?.trim();

    const arrangement = await this.cacheLockService.withLock(
      async () => {
        if (
          type === BillingArrangementType.COMMITTED_SEATS &&
          seatCapMode === BillingArrangementSeatCapMode.HARD &&
          isDefined(seats)
        ) {
          await this.assertHardSeatCapCoversBilledMembers({
            workspaceId,
            seats,
          });
        }

        return await this.billingArrangementService.insertArrangement({
          workspaceId,
          arrangement: {
            type,
            label,
            comment: isNonEmptyString(trimmedComment) ? trimmedComment : null,
            startsAt: new Date(),
            endsAt: endsAt ?? null,
            seats: seats ?? null,
            seatCapMode: seatCapMode ?? null,
            stripePriceId: null,
            stripeDiscountId: null,
            creditAllowanceMicro: isDefined(creditAllowance)
              ? Math.round(
                  creditAllowance * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
                )
              : null,
            stripeCreditNoteId: null,
            creditGrantId: null,
            usageLimitId: null,
          },
          grantedByUserId,
        });
      },
      buildBillingSeatLockKey(workspaceId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );

    await this.applyBillingArrangementChange(arrangement);

    return this.toBillingArrangementDTO(arrangement);
  }

  async endWorkspaceBillingArrangement({
    workspaceId,
    billingArrangementId,
    revokedByUserId,
  }: {
    workspaceId: string;
    billingArrangementId: string;
    revokedByUserId: string;
  }): Promise<AdminPanelWorkspaceBillingArrangementDTO> {
    this.assertBillingIsEnabled();

    const arrangement =
      await this.billingArrangementService.findArrangementOrThrow({
        workspaceId,
        arrangementId: billingArrangementId,
      });

    this.assertBillingArrangementIsManageable(arrangement.type);

    const endedArrangement =
      await this.billingArrangementService.endArrangement({
        arrangement,
        revokedByUserId,
      });

    await this.applyBillingArrangementChange(endedArrangement);

    return this.toBillingArrangementDTO(endedArrangement);
  }

  private assertBillingIsEnabled(): void {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      throw new BillingException(
        'Billing arrangements need billing to be enabled on this instance',
        BillingExceptionCode.BILLING_ARRANGEMENT_NOT_MANAGEABLE,
      );
    }
  }

  private assertBillingArrangementIsManageable(
    type: BillingArrangementType,
  ): void {
    this.assertBillingIsEnabled();

    if (!ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES.includes(type)) {
      throw new BillingException(
        `Cannot create or end a ${type} arrangement by hand`,
        BillingExceptionCode.BILLING_ARRANGEMENT_NOT_MANAGEABLE,
      );
    }
  }

  private async assertHardSeatCapCoversBilledMembers({
    workspaceId,
    seats,
  }: {
    workspaceId: string;
    seats: number;
  }): Promise<void> {
    const [memberCount, activeSeatArrangements] = await Promise.all([
      this.billingSeatService.countWorkspaceMembers(workspaceId),
      this.billingSeatService.findActiveSeatArrangements(workspaceId),
    ]);

    const billedSeatsWithoutCommitment = computeBilledSeats({
      memberCount,
      seatArrangements: activeSeatArrangements.filter(
        (arrangement) => arrangement.type === BillingArrangementType.FREE_SEATS,
      ),
    });

    if (billedSeatsWithoutCommitment > seats) {
      throw new BillingException(
        `Hard cap of ${seats} seats is below the ${billedSeatsWithoutCommitment} billed members of workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_SEAT_CAP_BELOW_MEMBERS,
      );
    }
  }

  private async applyBillingArrangementChange(
    arrangement: BillingArrangementEntity,
  ): Promise<void> {
    if (SEAT_BILLING_ARRANGEMENT_TYPES.includes(arrangement.type)) {
      await this.billingMessageQueueService.add<UpdateSubscriptionQuantityJobData>(
        UpdateSubscriptionQuantityJob.name,
        { workspaceId: arrangement.workspaceId },
        {
          ...UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS,
          workspaceId: arrangement.workspaceId,
          isWorkspaceJob: true,
        },
      );

      const endDate = getBillingArrangementEndDate(arrangement);
      const msUntilEnd = isDefined(endDate)
        ? endDate.getTime() - Date.now()
        : 0;

      if (msUntilEnd > 0) {
        await this.billingMessageQueueService.add<UpdateSubscriptionQuantityJobData>(
          UpdateSubscriptionQuantityJob.name,
          { workspaceId: arrangement.workspaceId },
          {
            ...UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS,
            delay: msUntilEnd,
            workspaceId: arrangement.workspaceId,
            isWorkspaceJob: true,
          },
        );
      }
    }

    if (
      arrangement.type === BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE
    ) {
      await this.billingCreditService.refreshWorkspaceCreditState(
        arrangement.workspaceId,
      );
    }
  }

  private async getWorkspaceBillingArrangements(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO[]> {
    const arrangements =
      await this.billingArrangementService.findArrangements(workspaceId);

    return arrangements.map((arrangement) =>
      this.toBillingArrangementDTO(arrangement),
    );
  }

  private toBillingArrangementDTO(
    arrangement: BillingArrangementEntity,
  ): AdminPanelWorkspaceBillingArrangementDTO {
    return {
      id: arrangement.id,
      type: arrangement.type,
      label: arrangement.label,
      comment: arrangement.comment,
      seats: arrangement.seats,
      seatCapMode: arrangement.seatCapMode,
      stripeDiscountId: arrangement.stripeDiscountId,
      creditAllowance: isDefined(arrangement.creditAllowanceMicro)
        ? toDisplayCredits(arrangement.creditAllowanceMicro)
        : null,
      stripeCreditNoteId: arrangement.stripeCreditNoteId,
      creditGrantId: arrangement.creditGrantId,
      usageLimitId: arrangement.usageLimitId,
      startsAt: arrangement.startsAt,
      endsAt: arrangement.endsAt,
      revokedAt: arrangement.revokedAt,
      endDate: getBillingArrangementEndDate(arrangement),
      status: getBillingArrangementStatus({ arrangement, now: new Date() }),
      isManageable: ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES.includes(
        arrangement.type,
      ),
      createdAt: arrangement.createdAt,
    };
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
      sourceGrantId: grant.sourceGrantId,
      reason: grant.reason,
      isActive:
        !isDefined(grant.revokedAt) &&
        grant.effectiveAt.getTime() <= now &&
        (!isDefined(grant.expiresAt) || grant.expiresAt.getTime() > now),
      createdAt: grant.createdAt,
    };
  }

  async getWorkspaceBilling(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingDTO | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const [customer, subscription, creditGrants, billingArrangements] =
      await Promise.all([
        this.billingCustomerRepository.findOne(workspaceId, { where: {} }),
        this.billingSubscriptionService.getCurrentBillingSubscription({
          workspaceId,
        }),
        this.getWorkspaceCreditGrants(workspaceId),
        this.getWorkspaceBillingArrangements(workspaceId),
      ]);

    const stripeCustomerId =
      customer?.stripeCustomerId ?? subscription?.stripeCustomerId ?? null;
    const creditBalance = toDisplayCredits(
      await this.billingCreditGrantService.getActiveCreditsMicro(workspaceId),
    );

    if (!subscription) {
      return {
        stripeCustomerId,
        creditBalance,
        creditGrants,
        billingArrangements,
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
      billingArrangements,
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
            quantity: isDefined(item.quantity) ? Number(item.quantity) : null,
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

      const workspaceCreditsUsed = toDisplayCredits(usage.workspaceCreditsUsed);
      const workspaceCreditsGranted = toDisplayCredits(
        usage.workspaceCreditsGranted,
      );
      const workspaceCreditsExtraGranted = toDisplayCredits(
        usage.workspaceCreditsExtraGranted,
      );
      const workspaceCreditsTotalGranted = toDisplayCredits(
        usage.workspaceCreditsTotalGranted,
      );

      return {
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        workspaceCreditsUsed,
        workspaceCreditsGranted,
        workspaceCreditsExtraGranted,
        workspaceCreditsTotalGranted,
        workspaceCreditsRemaining:
          workspaceCreditsTotalGranted - workspaceCreditsUsed,
        userCreditsUsed: toDisplayCredits(usage.userCreditsUsed),
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

// Namespaced to never collide with carry-forward or backfill keys in the same unique index
const buildAdminGrantIdempotencyKey = (clientOperationId: string): string =>
  `admin-grant:${clientOperationId}`;
