/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { buildUserUsageCacheKey } from 'src/engine/core-modules/billing/utils/build-user-usage-cache-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const USER_USAGE_CACHE_TTL_MS = 60_000;

@Injectable()
export class BillingBudgetGuardService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async canUserSpend(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<boolean> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return true;
    }

    const maxCredits = await this.resolveEffectiveMaxCredits(
      workspaceId,
      userWorkspaceId,
    );

    if (maxCredits === null) {
      return true;
    }

    const currentUsage = await this.getUserPeriodUsage(
      workspaceId,
      userWorkspaceId,
    );

    return currentUsage < maxCredits;
  }

  private async getUserPeriodUsage(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<number> {
    const cacheKey = buildUserUsageCacheKey(workspaceId, userWorkspaceId);
    const cached = await this.cacheStorage.get<number>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const periodStart = await this.getCurrentPeriodStart(workspaceId);

    const result = await this.clickHouseService.select<{ total: string }>(
      `SELECT SUM(creditsUsed) as total FROM billingEvent
       WHERE workspaceId = {workspaceId:String}
         AND userWorkspaceId = {userWorkspaceId:String}
         AND timestamp >= {periodStart:DateTime64}`,
      {
        workspaceId,
        userWorkspaceId,
        periodStart: formatDateForClickHouse(periodStart),
      },
    );

    const usage = Number(result[0]?.total ?? 0);

    await this.cacheStorage.set(cacheKey, usage, USER_USAGE_CACHE_TTL_MS);

    return usage;
  }

  private async resolveEffectiveMaxCredits(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<number | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
      select: ['maxAiChatCreditsPerPeriod'],
    });

    if (isDefined(userWorkspace?.maxAiChatCreditsPerPeriod)) {
      return userWorkspace.maxAiChatCreditsPerPeriod;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['defaultUserAiChatMaxCreditsPerPeriod'],
    });

    return workspace?.defaultUserAiChatMaxCreditsPerPeriod ?? null;
  }

  private async getCurrentPeriodStart(workspaceId: string): Promise<Date> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (!subscription) {
      return new Date(0);
    }

    const isTrialing =
      subscription.status === SubscriptionStatus.Trialing &&
      isDefined(subscription.trialStart);

    return isTrialing
      ? subscription.trialStart!
      : subscription.currentPeriodStart;
  }
}
