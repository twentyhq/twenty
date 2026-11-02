/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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

  async findWorkspaceCreditAllowances(
    workspaceId: string,
  ): Promise<WorkspaceCreditAllowanceWindow[]> {
    const arrangements = await this.billingArrangementRepository.find(
      workspaceId,
      { where: { type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE } },
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
