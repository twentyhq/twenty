/* @license Enterprise */

import { createHash, randomUUID } from 'crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type IdempotentChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/idempotent-charge.dto';
import { USAGE_UNIT_BY_OPERATION_TYPE } from 'src/engine/core-modules/billing/app-billing/usage-unit-by-operation-type.constant';
import { BillingAppChargeEntity } from 'src/engine/core-modules/billing/entities/billing-app-charge.entity';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { buildUsageEventEnvelopes } from 'src/engine/core-modules/usage/utils/build-usage-event-envelopes';

@Injectable()
export class AppBillingChargeService {
  private readonly logger = new Logger(AppBillingChargeService.name);

  constructor(
    // Receipt delivery scans all workspaces; acceptance explicitly scopes every lookup.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingAppChargeEntity)
    private readonly chargeRepository: Repository<BillingAppChargeEntity>,
    private readonly usageRecorderService: UsageRecorderService,
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingUsageCacheService: BillingUsageCacheService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async accept({
    workspaceId,
    applicationId,
    userWorkspaceId,
    charge,
  }: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string | null;
    charge: IdempotentChargeDto;
  }): Promise<{ status: 'accepted'; receiptId: string }> {
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          creditsUsedMicro: charge.creditsUsedMicro,
          quantity: charge.quantity,
          operationType: charge.operationType,
          resourceContext: charge.resourceContext ?? null,
        }),
      )
      .digest('hex');
    const where = {
      workspaceId,
      applicationId,
      idempotencyKey: charge.idempotencyKey,
    };
    let receipt = await this.chargeRepository.findOneBy(where);

    if (!receipt) {
      const events = await this.usageRecorderService.prepareEvents(
        workspaceId,
        [
          {
            resourceType: UsageResourceType.APP,
            operationType: charge.operationType,
            creditsUsedMicro: charge.creditsUsedMicro,
            quantity: charge.quantity,
            unit: USAGE_UNIT_BY_OPERATION_TYPE[charge.operationType],
            resourceId: applicationId,
            resourceContext: charge.resourceContext ?? null,
            spenders: { applicationId, userWorkspaceId },
          },
        ],
      );
      const [envelope] = buildUsageEventEnvelopes(workspaceId, events);

      if (!events[0]?.periodStart) {
        throw new ServiceUnavailableException(
          'App billing period is not available yet.',
        );
      }

      await this.chargeRepository
        .createQueryBuilder()
        .insert()
        .values({
          ...where,
          id: randomUUID(),
          requestHash,
          usageRow: () => ':usageRow',
        })
        .setParameter('usageRow', JSON.stringify(envelope.row))
        .orIgnore()
        .execute();
      receipt = await this.chargeRepository.findOneByOrFail(where);
    }

    if (receipt.requestHash !== requestHash) {
      throw new ConflictException(
        'This idempotency key was already used for a different charge.',
      );
    }

    return { status: 'accepted', receiptId: receipt.id };
  }

  async deliverPending(): Promise<void> {
    if (
      !this.twentyConfigService.get('IS_BILLING_ENABLED') ||
      !this.clickHouseService.getMainClient()
    )
      return;

    const now = new Date();
    const receipts = await this.chargeRepository.find({
      where: { deliveredAt: IsNull(), nextAttemptAt: LessThanOrEqual(now) },
      order: { nextAttemptAt: 'ASC', id: 'ASC' },
      take: 20,
    });

    for (const receipt of receipts) {
      try {
        // Rotating the batch before I/O also recovers jobs interrupted mid-delivery.
        const claimed = await this.chargeRepository.update(
          {
            id: receipt.id,
            deliveredAt: IsNull(),
            nextAttemptAt: LessThanOrEqual(now),
          },
          { nextAttemptAt: new Date(now.getTime() + 60_000) },
        );
        if (claimed.affected !== 1) continue;

        const result = await this.clickHouseService.insert('appUsageEvent', [
          {
            ...receipt.usageRow,
            receiptId: receipt.id,
          },
        ]);
        if (!result.success) throw new Error(result.error.message);

        // Invalidation is safe to repeat if delivery succeeds but its acknowledgement is lost.
        await this.cacheLockService.withLock(
          () =>
            this.billingUsageCacheService.flushAvailableCredits(
              receipt.workspaceId,
            ),
          buildBillingCreditStateLockKey(receipt.workspaceId),
        );
        await this.chargeRepository.update(
          { id: receipt.id },
          { deliveredAt: new Date() },
        );
      } catch (error) {
        this.logger.error(`App charge ${receipt.id} remains pending`, error);
      }
    }
  }
}
