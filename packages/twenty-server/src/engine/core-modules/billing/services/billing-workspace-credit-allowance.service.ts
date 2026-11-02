/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, IsNull, MoreThan } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type WorkspaceCreditAllowanceWindow } from 'src/engine/core-modules/billing/types/workspace-credit-allowance-window.type';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingWorkspaceCreditAllowanceService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
  ) {}

  async findUnexpiredWorkspaceCreditAllowances(
    workspaceId: string,
  ): Promise<WorkspaceCreditAllowanceWindow[]> {
    return this.findWorkspaceCreditAllowances(workspaceId, [
      { revokedAt: IsNull(), endsAt: IsNull() },
      { revokedAt: IsNull(), endsAt: MoreThan(new Date()) },
    ]);
  }

  async findActiveWorkspaceCreditAllowanceMicro({
    workspaceId,
    nowMs,
    interval,
    isTrialing,
  }: {
    workspaceId: string;
    nowMs: number;
    interval: SubscriptionInterval;
    isTrialing: boolean;
  }): Promise<number | null> {
    return findActiveWorkspaceCreditAllowanceMicro({
      workspaceCreditAllowances: await this.findWorkspaceCreditAllowances(
        workspaceId,
        [{}],
      ),
      nowMs,
      interval,
      isTrialing,
    });
  }

  private async findWorkspaceCreditAllowances(
    workspaceId: string,
    where: FindOptionsWhere<BillingArrangementEntity>[],
  ): Promise<WorkspaceCreditAllowanceWindow[]> {
    const arrangements = await this.billingArrangementRepository.find(
      workspaceId,
      {
        where: where.map((clause) => ({
          ...clause,
          type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
        })),
      },
    );

    return arrangements.flatMap(({ creditAllowanceMicro, ...arrangement }) =>
      isDefined(creditAllowanceMicro)
        ? [
            {
              creditAllowanceMicro,
              startsAtMs: arrangement.startsAt.getTime(),
              endsAtMs:
                getBillingArrangementEndDate(arrangement)?.getTime() ?? null,
            },
          ]
        : [],
    );
  }
}
