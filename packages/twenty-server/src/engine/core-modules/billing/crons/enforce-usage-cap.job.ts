/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

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

    let batch: BillingSubscriptionEntity[];
    let idRows: { subscription_id: string }[];

    do {
      idRows = await this.billingSubscriptionRepository
        .createQueryBuilder('subscription')
        .select('subscription.id')
        .innerJoin('subscription.workspace', 'workspace')
        .where('subscription.status IN (:...statuses)', {
          statuses: [
            SubscriptionStatus.Active,
            SubscriptionStatus.Trialing,
            SubscriptionStatus.PastDue,
          ],
        })
        .andWhere('workspace.suspendedAt IS NULL')
        .orderBy('subscription.id', 'ASC')
        .limit(BATCH_SIZE)
        .offset(offset)
        .getRawMany<{ subscription_id: string }>();

      if (idRows.length === 0) {
        break;
      }

      const ids = idRows.map((row) => row.subscription_id);

      batch = await this.billingSubscriptionRepository
        .createQueryBuilder('subscription')
        .innerJoinAndSelect(
          'subscription.billingSubscriptionItems',
          'item',
          'item.billingSubscriptionId = subscription.id',
        )
        .innerJoinAndSelect('item.billingProduct', 'product')
        .leftJoinAndSelect('product.billingPrices', 'price')
        .innerJoinAndSelect('subscription.billingCustomer', 'customer')
        .where('subscription.id IN (:...ids)', { ids })
        .orderBy('subscription.id', 'ASC')
        .getMany();

      if (batch.length === 0) {
        break;
      }

      const periodGroups = this.groupByPeriod(batch);
      const usageByWorkspace = new Map<string, number>();
      const failedWorkspaceIds = new Set<string>();

      for (const [, group] of periodGroups) {
        try {
          const workspaceIds = group.map((s) => s.workspaceId);
          const batchUsage =
            await this.billingUsageCapService.getBatchPeriodCreditsUsed(
              workspaceIds,
              group[0].currentPeriodStart,
              group[0].currentPeriodEnd,
            );

          for (const [id, usage] of batchUsage) {
            usageByWorkspace.set(id, usage);
          }
        } catch (error) {
          for (const sub of group) {
            failedWorkspaceIds.add(sub.workspaceId);
          }
          errors += group.length;
          this.logger.error(
            `Failed to fetch batch usage from ClickHouse for ${group.length} subscriptions`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      const creditBalanceByCustomer = new Map<string, number>();

      for (const subscription of batch) {
        if (subscription.billingCustomer) {
          creditBalanceByCustomer.set(
            subscription.stripeCustomerId,
            subscription.billingCustomer.creditBalanceMicro,
          );
        }
      }

      const evaluations = this.billingUsageCapService.evaluateCapBatch(
        batch,
        usageByWorkspace,
        creditBalanceByCustomer,
      );

      const idsToCapTrue: string[] = [];
      const idsToCapFalse: string[] = [];

      for (const subscription of batch) {
        if (failedWorkspaceIds.has(subscription.workspaceId)) {
          continue;
        }

        const evaluation = evaluations.get(subscription.id);

        if (!evaluation || evaluation.skipped) {
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

        if (shouldBeCapped) {
          idsToCapTrue.push(meteredItem.id);
        } else {
          idsToCapFalse.push(meteredItem.id);
        }

        this.logger.log(
          `Set hasReachedCurrentPeriodCap=${shouldBeCapped} ` +
            `for subscription=${subscription.id} workspace=${subscription.workspaceId} ` +
            `usage=${evaluation.usage} allowance=${evaluation.allowance} ` +
            `tierCap=${evaluation.tierCap} creditBalance=${evaluation.creditBalance}`,
        );
      }

      if (idsToCapTrue.length > 0) {
        await this.billingSubscriptionItemRepository.update(
          { id: In(idsToCapTrue) },
          { hasReachedCurrentPeriodCap: true },
        );
        transitioned += idsToCapTrue.length;
      }

      if (idsToCapFalse.length > 0) {
        await this.billingSubscriptionItemRepository.update(
          { id: In(idsToCapFalse) },
          { hasReachedCurrentPeriodCap: false },
        );
        transitioned += idsToCapFalse.length;
      }

      offset += idRows.length;
    } while (idRows.length === BATCH_SIZE);

    this.logger.log(
      `Usage cap enforcement run complete: evaluated=${evaluated} ` +
        `transitioned=${transitioned} errors=${errors} ` +
        `mode=${isEnforcementActive ? 'active' : 'shadow'}`,
    );
  }

  private groupByPeriod(
    subscriptions: BillingSubscriptionEntity[],
  ): Map<string, BillingSubscriptionEntity[]> {
    const groups = new Map<string, BillingSubscriptionEntity[]>();

    for (const subscription of subscriptions) {
      const key = `${subscription.currentPeriodStart.toISOString()}|${subscription.currentPeriodEnd.toISOString()}`;
      const group = groups.get(key);

      if (group) {
        group.push(subscription);
      } else {
        groups.set(key, [subscription]);
      }
    }

    return groups;
  }
}
