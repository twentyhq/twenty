/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingCreditService {
  private readonly logger = new Logger(BillingCreditService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly billingUsageCacheService: BillingUsageCacheService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  async creditWorkspaceBalance({
    workspaceId,
    amountMicro,
  }: {
    workspaceId: string;
    amountMicro: number;
  }): Promise<void> {
    if (!this.billingService.isBillingEnabled()) {
      return;
    }

    if (!Number.isSafeInteger(amountMicro) || amountMicro <= 0) {
      throw new BillingException(
        `Cannot credit an amount (${amountMicro}) that is not a positive safe integer to workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    const { affected } = await this.billingCustomerRepository.increment(
      workspaceId,
      {},
      'creditBalanceMicro',
      amountMicro,
    );

    if (!isDefined(affected) || affected === 0) {
      this.logger.warn(
        `Skipped crediting ${amountMicro} credits: no billing customer for workspace ${workspaceId}`,
      );

      return;
    }

    await this.billingUsageCacheService.flushAvailableCredits(workspaceId);
  }
}
