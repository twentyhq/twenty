/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { enforceUsageCapCronPattern } from 'src/engine/core-modules/billing/crons/enforce-usage-cap.cron.pattern';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const BATCH_SIZE = 100;

@Injectable()
@Processor(MessageQueue.cronQueue)
export class EnforceUsageCapJob {
  private readonly logger = new Logger(EnforceUsageCapJob.name);

  constructor(
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly billingUsageCapService: BillingUsageCapService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(EnforceUsageCapJob.name)
  @SentryCronMonitor(EnforceUsageCapJob.name, enforceUsageCapCronPattern)
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    if (!this.billingUsageCapService.isClickHouseEnabled()) {
      this.logger.debug(
        'ClickHouse is not configured; skipping usage cap enforcement',
      );

      return;
    }

    const isEnforcementActive = this.twentyConfigService.get(
      'BILLING_USAGE_CAP_CLICKHOUSE_ENABLED',
    );

    let evaluated = 0;
    let transitioned = 0;
    let errors = 0;
    let offset = 0;

    // Process subscriptions in batches, only loading those that have a
    // metered (WORKFLOW_NODE_EXECUTION) item to skip the majority that don't.
    let batch: BillingSubscriptionEntity[];

    do {
      batch = await this.billingSubscriptionRepository
        .createQueryBuilder('subscription')
        .innerJoinAndSelect(
          'subscription.billingSubscriptionItems',
          'item',
          'item.billingSubscriptionId = subscription.id',
        )
        .innerJoinAndSelect('item.billingProduct', 'product')
        .leftJoinAndSelect('product.billingPrices', 'price')
        .where('subscription.status IN (:...statuses)', {
          statuses: [
            SubscriptionStatus.Active,
            SubscriptionStatus.Trialing,
            SubscriptionStatus.PastDue,
          ],
        })
        .andWhere("product.metadata->>'productKey' = :productKey", {
          productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
        })
        .orderBy('subscription.id', 'ASC')
        .take(BATCH_SIZE)
        .skip(offset)
        .getMany();

      for (const subscription of batch) {
        try {
          const evaluation =
            await this.billingUsageCapService.evaluateCap(subscription);

          if (evaluation.skipped) {
            continue;
          }

          evaluated += 1;

          const meteredItem = subscription.billingSubscriptionItems.find(
            (item) =>
              item.billingProduct?.metadata?.productKey ===
              BillingProductKey.WORKFLOW_NODE_EXECUTION,
          );

          if (!meteredItem) {
            continue;
          }

          const shouldBeCapped = evaluation.hasReachedCap;

          if (meteredItem.hasReachedCurrentPeriodCap === shouldBeCapped) {
            continue;
          }

          if (!isEnforcementActive) {
            this.logger.log(
              `[shadow] would set hasReachedCurrentPeriodCap=${shouldBeCapped} ` +
                `for subscription=${subscription.id} workspace=${subscription.workspaceId} ` +
                `usage=${evaluation.usage} allowance=${evaluation.allowance} ` +
                `tierCap=${evaluation.tierCap} creditBalance=${evaluation.creditBalance}`,
            );
            continue;
          }

          await this.billingSubscriptionItemRepository.update(
            { id: meteredItem.id },
            { hasReachedCurrentPeriodCap: shouldBeCapped },
          );

          transitioned += 1;

          this.logger.log(
            `Set hasReachedCurrentPeriodCap=${shouldBeCapped} ` +
              `for subscription=${subscription.id} workspace=${subscription.workspaceId} ` +
              `usage=${evaluation.usage} allowance=${evaluation.allowance} ` +
              `tierCap=${evaluation.tierCap} creditBalance=${evaluation.creditBalance}`,
          );
        } catch (error) {
          errors += 1;
          this.logger.error(
            `Failed to evaluate usage cap for subscription=${subscription.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      offset += batch.length;
    } while (batch.length === BATCH_SIZE);

    this.logger.log(
      `Usage cap enforcement run complete: evaluated=${evaluated} ` +
        `transitioned=${transitioned} errors=${errors} ` +
        `mode=${isEnforcementActive ? 'active' : 'shadow'}`,
    );
  }
}
