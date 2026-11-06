/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { buildBillingSeatLockKey } from 'src/engine/core-modules/billing/utils/build-billing-seat-lock-key.util';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { isSeatLimitReached } from 'src/engine/core-modules/billing/utils/is-seat-limit-reached.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class BillingSeatService {
  constructor(
    private readonly billingArrangementService: BillingArrangementService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async countWorkspaceMembers(workspaceId: string): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return await workspaceMemberRepository.count();
      },
      authContext,
      { lite: true },
    );
  }

  async findSeatArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementService.findArrangementsByTypes({
      workspaceId,
      types: SEAT_BILLING_ARRANGEMENT_TYPES,
    });
  }

  async findActiveSeatArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    const now = new Date();

    return (await this.findSeatArrangements(workspaceId)).filter(
      (arrangement) => isBillingArrangementActive({ arrangement, now }),
    );
  }

  async computeCurrentBilledSeats(workspaceId: string): Promise<number | null> {
    const memberCount = await this.countWorkspaceMembers(workspaceId);

    if (memberCount <= 0) {
      return null;
    }

    return computeBilledSeats({
      memberCount,
      seatArrangements: await this.findActiveSeatArrangements(workspaceId),
    });
  }

  async isWorkspaceAtSeatLimit(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return false;
    }

    return isSeatLimitReached({
      memberCount: await this.countWorkspaceMembers(workspaceId),
      seatArrangements: await this.findActiveSeatArrangements(workspaceId),
    });
  }

  async addMemberWithinSeatLimit<TResult>({
    workspaceId,
    addMember,
  }: {
    workspaceId: string;
    addMember: () => Promise<TResult>;
  }): Promise<TResult> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return await addMember();
    }

    return await this.cacheLockService.withLock(
      async () => {
        if (await this.isWorkspaceAtSeatLimit(workspaceId)) {
          throw new BillingException(
            `Workspace ${workspaceId} has reached its committed seats`,
            BillingExceptionCode.BILLING_SEAT_LIMIT_REACHED,
          );
        }

        return await addMember();
      },
      buildBillingSeatLockKey(workspaceId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }
}
