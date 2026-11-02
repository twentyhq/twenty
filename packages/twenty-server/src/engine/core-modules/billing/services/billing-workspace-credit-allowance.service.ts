/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type WorkspaceCreditAllowanceWindow } from 'src/engine/core-modules/billing/types/workspace-credit-allowance-window.type';
import { computeWorkspaceCreditAllowanceForPeriodMicro } from 'src/engine/core-modules/billing/utils/compute-workspace-credit-allowance-for-period-micro.util';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type WorkspaceCreditAllowanceLookup = {
  workspaceId: string;
  interval: SubscriptionInterval;
  isTrialing: boolean;
};

@Injectable()
export class BillingWorkspaceCreditAllowanceService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
  ) {}

  async findWorkspaceCreditAllowanceWindows({
    workspaceId,
    interval,
    isTrialing,
    endingAfter,
  }: WorkspaceCreditAllowanceLookup & {
    endingAfter: Date;
  }): Promise<WorkspaceCreditAllowanceWindow[]> {
    const arrangements = await this.billingArrangementRepository.find(
      workspaceId,
      { where: { type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE } },
    );

    return arrangements.flatMap((arrangement) => {
      const endDate = getBillingArrangementEndDate(arrangement);

      if (
        !isDefined(arrangement.creditAllowanceMicro) ||
        (isDefined(endDate) && endDate <= endingAfter)
      ) {
        return [];
      }

      return [
        {
          amountMicro: computeWorkspaceCreditAllowanceForPeriodMicro({
            creditAllowanceMicro: arrangement.creditAllowanceMicro,
            interval,
            isTrialing,
          }),
          startsAtMs: arrangement.startsAt.getTime(),
          endsAtMs: endDate?.getTime() ?? null,
        },
      ];
    });
  }

  async findActiveWorkspaceCreditAllowanceMicro({
    at,
    ...lookup
  }: WorkspaceCreditAllowanceLookup & { at: Date }): Promise<number | null> {
    return findActiveWorkspaceCreditAllowanceMicro({
      workspaceCreditAllowances: await this.findWorkspaceCreditAllowanceWindows(
        { ...lookup, endingAfter: at },
      ),
      nowMs: at.getTime(),
    });
  }
}
