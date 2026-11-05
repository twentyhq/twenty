/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import { Between, In, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-retry-options.constant';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import {
  UpdateSubscriptionQuantityJob,
  type UpdateSubscriptionQuantityJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { BILLING_SEAT_ARRANGEMENT_SYNC_CRON_PATTERN } from 'src/engine/core-modules/billing/seat-arrangement-sync/constants/billing-seat-arrangement-sync.cron-pattern.constant';
import { BILLING_SEAT_ARRANGEMENT_SYNC_LOOKBACK_MS } from 'src/engine/core-modules/billing/seat-arrangement-sync/constants/billing-seat-arrangement-sync-lookback-ms.constant';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Processor(MessageQueue.cronQueue)
export class BillingSeatArrangementSyncCronJob {
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: Repository<BillingArrangementEntity>,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(BillingSeatArrangementSyncCronJob.name)
  @SentryCronMonitor(
    BillingSeatArrangementSyncCronJob.name,
    BILLING_SEAT_ARRANGEMENT_SYNC_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const now = new Date();
    const type = In(SEAT_BILLING_ARRANGEMENT_TYPES);
    const changedSinceLookback = Between(
      new Date(now.getTime() - BILLING_SEAT_ARRANGEMENT_SYNC_LOOKBACK_MS),
      now,
    );

    const changedSeatArrangements =
      await this.billingArrangementRepository.find({
        select: { workspaceId: true },
        where: [
          { type, startsAt: changedSinceLookback },
          { type, endsAt: changedSinceLookback },
          { type, revokedAt: changedSinceLookback },
          { type, updatedAt: changedSinceLookback },
        ],
      });

    const workspaceIds = new Set(
      changedSeatArrangements.map(({ workspaceId }) => workspaceId),
    );

    if (workspaceIds.size === 0) {
      return;
    }

    try {
      await this.messageQueueService.bulkAdd<UpdateSubscriptionQuantityJobData>(
        UpdateSubscriptionQuantityJob.name,
        [...workspaceIds].map((workspaceId) => ({
          data: { workspaceId },
          workspaceId,
          isWorkspaceJob: true,
        })),
        UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS,
      );
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceIds: [...workspaceIds] },
      });
    }
  }
}
