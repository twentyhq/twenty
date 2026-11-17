import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { type AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { type CreateWorkspaceBillingArrangementInput } from 'src/engine/core-modules/admin-panel/dtos/create-workspace-billing-arrangement.input';
import { type UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { fromBillingArrangementEntityToDto } from 'src/engine/core-modules/admin-panel/utils/from-billing-arrangement-entity-to-dto.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-retry-options.constant';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import {
  ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES,
  BillingArrangementType,
} from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import {
  UpdateSubscriptionQuantityJob,
  type UpdateSubscriptionQuantityJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { buildBillingSeatLockKey } from 'src/engine/core-modules/billing/utils/build-billing-seat-lock-key.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class AdminPanelBillingArrangementService {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly billingMessageQueueService: MessageQueueService,
    private readonly billingArrangementService: BillingArrangementService,
    private readonly usageLimitService: UsageLimitService,
    private readonly billingSeatService: BillingSeatService,
    private readonly billingCreditService: BillingCreditService,
    private readonly cacheLockService: CacheLockService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findWorkspaceBillingArrangements(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO[]> {
    const arrangements =
      await this.billingArrangementService.findArrangements(workspaceId);
    const [operatorsById, usageLimitsById] = await Promise.all([
      this.findOperatorsById(arrangements),
      this.findUsageLimitsById({ workspaceId, arrangements }),
    ]);
    const now = new Date();

    return arrangements.map((arrangement) =>
      fromBillingArrangementEntityToDto({
        arrangement,
        now,
        operatorsById,
        usageLimitsById,
      }),
    );
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

    const draft: BillingArrangementDraft = {
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
        ? Math.round(creditAllowance * INTERNAL_CREDITS_PER_DISPLAY_CREDIT)
        : null,
      stripeCreditNoteId: null,
      creditGrantId: null,
      usageLimitId: null,
    };

    const arrangement = await this.cacheLockService.withLock(
      async () => {
        if (type === BillingArrangementType.COMMITTED_SEATS) {
          const activeSeatArrangements =
            await this.billingSeatService.findActiveSeatArrangements(
              workspaceId,
            );

          await this.billingSeatService.assertHardSeatCapCoversBilledMembersOrThrow(
            {
              workspaceId,
              seatArrangements: [
                { ...draft, revokedAt: null },
                ...activeSeatArrangements.filter(
                  (activeArrangement) =>
                    activeArrangement.type ===
                    BillingArrangementType.FREE_SEATS,
                ),
              ],
            },
          );
        }

        return await this.billingArrangementService.insertArrangement({
          workspaceId,
          arrangement: draft,
          grantedByUserId,
        });
      },
      buildBillingSeatLockKey(workspaceId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );

    await this.applyBillingArrangementChange(arrangement);

    return fromBillingArrangementEntityToDto({
      arrangement,
      now: new Date(),
      operatorsById: await this.findOperatorsById([arrangement]),
      usageLimitsById: await this.findUsageLimitsById({
        workspaceId,
        arrangements: [arrangement],
      }),
    });
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

    const endedArrangement = await this.cacheLockService.withLock(
      async () => {
        const arrangement =
          await this.billingArrangementService.findArrangementOrThrow({
            workspaceId,
            arrangementId: billingArrangementId,
          });

        this.assertBillingArrangementIsManageable(arrangement.type);

        if (arrangement.type === BillingArrangementType.FREE_SEATS) {
          const activeSeatArrangements =
            await this.billingSeatService.findActiveSeatArrangements(
              workspaceId,
            );

          await this.billingSeatService.assertHardSeatCapCoversBilledMembersOrThrow(
            {
              workspaceId,
              seatArrangements: activeSeatArrangements.filter(
                (activeArrangement) => activeArrangement.id !== arrangement.id,
              ),
            },
          );
        }

        return await this.billingArrangementService.endArrangement({
          arrangement,
          revokedByUserId,
        });
      },
      buildBillingSeatLockKey(workspaceId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );

    await this.applyBillingArrangementChange(endedArrangement);

    return fromBillingArrangementEntityToDto({
      arrangement: endedArrangement,
      now: new Date(),
      operatorsById: await this.findOperatorsById([endedArrangement]),
      usageLimitsById: await this.findUsageLimitsById({
        workspaceId,
        arrangements: [endedArrangement],
      }),
    });
  }

  private async findOperatorsById(
    arrangements: BillingArrangementEntity[],
  ): Promise<Map<string, UserInfoDTO>> {
    const userIds = [
      ...new Set(
        arrangements
          .flatMap(({ grantedByUserId, revokedByUserId }) => [
            grantedByUserId,
            revokedByUserId,
          ])
          .filter(isDefined),
      ),
    ];

    if (userIds.length === 0) {
      return new Map();
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      withDeleted: true,
    });

    return new Map(
      users.map(({ id, email, firstName, lastName, createdAt }) => [
        id,
        { id, email, firstName, lastName, createdAt },
      ]),
    );
  }

  private async findUsageLimitsById({
    workspaceId,
    arrangements,
  }: {
    workspaceId: string;
    arrangements: BillingArrangementEntity[];
  }): Promise<Map<string, UsageLimitDTO>> {
    const usageLimitIds = [
      ...new Set(
        arrangements.map(({ usageLimitId }) => usageLimitId).filter(isDefined),
      ),
    ];

    if (usageLimitIds.length === 0) {
      return new Map();
    }

    const usageLimits = await this.usageLimitService.findByIds({
      workspaceId,
      usageLimitIds,
    });

    return new Map(
      usageLimits.map((usageLimit) => [
        usageLimit.id,
        fromUsageLimitEntityToDto(usageLimit),
      ]),
    );
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
    }

    if (
      arrangement.type === BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE
    ) {
      await this.billingCreditService.refreshWorkspaceCreditState(
        arrangement.workspaceId,
      );
    }
  }
}
