/* @license Enterprise */

import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Between, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/billing/limit-override/constants/billing-limit-override-expiry.cron-pattern.constant';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';

// Hourly runs retry a failed deletion for a day; an already removed limit is a no-op
const EXPIRED_LIMIT_OVERRIDE_LOOKBACK_MS = 24 * 60 * 60 * 1000;

@Processor(MessageQueue.cronQueue)
export class BillingLimitOverrideExpiryCronJob {
  private readonly logger = new Logger(BillingLimitOverrideExpiryCronJob.name);

  constructor(
    // Expired overrides are swept across every workspace
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: Repository<BillingArrangementEntity>,
    private readonly usageLimitService: UsageLimitService,
  ) {}

  @Process(BillingLimitOverrideExpiryCronJob.name)
  @SentryCronMonitor(
    BillingLimitOverrideExpiryCronJob.name,
    BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const now = new Date();

    const expiredLimitOverrides = await this.billingArrangementRepository.find({
      select: { workspaceId: true, usageLimitId: true },
      where: {
        type: BillingArrangementType.LIMIT_OVERRIDE,
        endsAt: Between(
          new Date(now.getTime() - EXPIRED_LIMIT_OVERRIDE_LOOKBACK_MS),
          now,
        ),
      },
    });

    for (const { workspaceId, usageLimitId } of expiredLimitOverrides) {
      if (!isDefined(usageLimitId)) {
        continue;
      }

      try {
        await this.usageLimitService.delete({
          workspaceId,
          usageLimitId,
          isOperator: true,
        });
      } catch (error) {
        this.logger.error(
          `Could not delete the expired limit override ${usageLimitId} of workspace ${workspaceId}`,
          error,
        );
      }
    }
  }
}
