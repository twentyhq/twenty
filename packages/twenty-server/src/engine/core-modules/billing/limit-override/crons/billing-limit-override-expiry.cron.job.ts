/* @license Enterprise */

import groupBy from 'lodash.groupby';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { LessThanOrEqual, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN } from 'src/engine/core-modules/billing/limit-override/constants/billing-limit-override-expiry.cron-pattern.constant';
import {
  BillingLimitOverrideExpiryJob,
  type BillingLimitOverrideExpiryJobData,
} from 'src/engine/core-modules/billing/limit-override/jobs/billing-limit-override-expiry.job';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

@Processor(MessageQueue.cronQueue)
export class BillingLimitOverrideExpiryCronJob {
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: Repository<BillingArrangementEntity>,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(BillingLimitOverrideExpiryCronJob.name)
  @SentryCronMonitor(
    BillingLimitOverrideExpiryCronJob.name,
    BILLING_LIMIT_OVERRIDE_EXPIRY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const expiredLimitOverrides = await this.billingArrangementRepository
      .createQueryBuilder('billingArrangement')
      .innerJoin(
        UsageLimitEntity,
        'usageLimit',
        '"usageLimit"."id" = "billingArrangement"."usageLimitId"',
      )
      .select([
        'billingArrangement.id',
        'billingArrangement.workspaceId',
        'billingArrangement.usageLimitId',
      ])
      .where({
        type: BillingArrangementType.LIMIT_OVERRIDE,
        endsAt: LessThanOrEqual(new Date()),
      })
      .getMany();

    const expiredLimitOverridesByWorkspaceId = groupBy(
      expiredLimitOverrides,
      'workspaceId',
    );

    for (const [workspaceId, workspaceLimitOverrides] of Object.entries(
      expiredLimitOverridesByWorkspaceId,
    )) {
      const usageLimitIds = workspaceLimitOverrides
        .map(({ usageLimitId }) => usageLimitId)
        .filter(isDefined);

      try {
        await this.messageQueueService.add<BillingLimitOverrideExpiryJobData>(
          BillingLimitOverrideExpiryJob.name,
          { workspaceId, usageLimitIds },
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
