/* @license Enterprise */

import groupBy from 'lodash.groupby';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { USAGE_LIMIT_INSTANCE_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/usage-limit/instance-override/constants/usage-limit-instance-override-expiry.cron-pattern.constant';
import {
  UsageLimitInstanceOverrideExpiryJob,
  type UsageLimitInstanceOverrideExpiryJobData,
} from 'src/engine/core-modules/usage-limit/instance-override/jobs/usage-limit-instance-override-expiry.job';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

@Processor(MessageQueue.cronQueue)
export class UsageLimitInstanceOverrideExpiryCronJob {
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(UsageLimitEntity)
    private readonly usageLimitRepository: Repository<UsageLimitEntity>,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(UsageLimitInstanceOverrideExpiryCronJob.name)
  @SentryCronMonitor(
    UsageLimitInstanceOverrideExpiryCronJob.name,
    USAGE_LIMIT_INSTANCE_OVERRIDE_EXPIRY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const expiredUsageLimits = await this.usageLimitRepository
      .createQueryBuilder('usageLimit')
      .innerJoin(
        BillingArrangementEntity,
        'billingArrangement',
        '"billingArrangement"."usageLimitId" = "usageLimit"."id" AND "billingArrangement"."type" = :type AND "billingArrangement"."endsAt" <= :now',
        { type: BillingArrangementType.LIMIT_OVERRIDE, now: new Date() },
      )
      .select(['usageLimit.id', 'usageLimit.workspaceId'])
      .where({ isInstanceOverride: true })
      .getMany();

    const expiredUsageLimitsByWorkspaceId = groupBy(
      expiredUsageLimits,
      'workspaceId',
    );

    for (const [workspaceId, workspaceUsageLimits] of Object.entries(
      expiredUsageLimitsByWorkspaceId,
    )) {
      try {
        await this.messageQueueService.add<UsageLimitInstanceOverrideExpiryJobData>(
          UsageLimitInstanceOverrideExpiryJob.name,
          {
            workspaceId,
            usageLimitIds: workspaceUsageLimits.map(({ id }) => id),
          },
          { workspaceId, isWorkspaceJob: true },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }
}
