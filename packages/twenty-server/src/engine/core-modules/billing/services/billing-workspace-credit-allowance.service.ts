/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, IsNull, MoreThan, Or } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type WorkspaceCreditAllowanceWindow } from 'src/engine/core-modules/billing/types/workspace-credit-allowance-window.type';
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
    const now = new Date();

    return this.findWorkspaceCreditAllowances({
      workspaceId,
      where: {
        revokedAt: Or(IsNull(), MoreThan(now)),
        endsAt: Or(IsNull(), MoreThan(now)),
      },
    });
  }

  async findAllWorkspaceCreditAllowances(
    workspaceId: string,
  ): Promise<WorkspaceCreditAllowanceWindow[]> {
    return this.findWorkspaceCreditAllowances({ workspaceId, where: {} });
  }

  private async findWorkspaceCreditAllowances({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: FindOptionsWhere<BillingArrangementEntity>;
  }): Promise<WorkspaceCreditAllowanceWindow[]> {
    const arrangements = await this.billingArrangementRepository.find(
      workspaceId,
      {
        where: {
          ...where,
          type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
        },
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
