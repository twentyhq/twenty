import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type CreditCounterCheck } from 'src/engine/core-modules/usage-limit/types/credit-counter-check.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';
import { type MemberCreditsCounterCheckReport } from 'src/engine/core-modules/usage-limit/types/member-credits-counter-check-report.type';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildCreditCounterCheck } from 'src/engine/core-modules/usage-limit/utils/build-credit-counter-check.util';
import { buildMemberAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-member-allowance-counter-key.util';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type MemberCreditsCounterChecks = NonNullable<
  MemberCreditsCounterCheckReport['memberCredits']
>;

@Injectable()
export class MemberCreditsCounterCheckService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly billingCreditAllowanceService: BillingCreditAllowanceService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    @InjectWorkspaceScopedRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: WorkspaceScopedRepository<UserWorkspaceEntity>,
  ) {}

  async checkCounters({
    workspaceId,
    turnCostMicro,
  }: {
    workspaceId: string;
    turnCostMicro: number;
  }): Promise<MemberCreditsCounterCheckReport | null> {
    if (
      !(await this.billingCreditAllowanceService.isCreditAllowanceEnabled())
    ) {
      return null;
    }

    // A swallowed failure would read as member credits off and leave every member counter unchecked
    const allowance =
      await this.billingCreditAllowanceService.getCreditAllowance(workspaceId, {
        shouldThrowOnMemberCreditsFailure: true,
      });

    if (!isDefined(allowance)) {
      return null;
    }

    const [allowanceCheck, memberCreditsChecks] = await Promise.all([
      this.checkAllowanceCounter({ workspaceId, allowance, turnCostMicro }),
      isDefined(allowance.memberCredits)
        ? this.checkMemberCounters({
            workspaceId,
            memberCredits: allowance.memberCredits,
            turnCostMicro,
          })
        : null,
    ]);

    return {
      allowance: {
        periodStart: allowance.periodStart,
        periodEnd: allowance.periodEnd,
        limitValueMicro: computeCreditAllowanceMicro({
          planAllowanceMicro: allowance.planAllowanceMicro,
          grants: allowance.grants,
          nowMs: Date.now(),
        }),
        check: allowanceCheck,
      },
      memberCredits: memberCreditsChecks,
    };
  }

  private async checkAllowanceCounter({
    workspaceId,
    allowance,
    turnCostMicro,
  }: {
    workspaceId: string;
    allowance: CreditAllowance;
    turnCostMicro: number;
  }): Promise<CreditCounterCheck> {
    const key = buildAllowanceCounterKey({
      workspaceId,
      periodStart: allowance.periodStart,
    });

    const [[liveValueMicro], { workspaceFundedCreditsUsedMicro }] =
      await Promise.all([
        this.readLiveValues([key]),
        this.usageAnalyticsService.getWorkspaceFundedCreditsUsedMicroForBillingPeriod(
          {
            workspaceId,
            periodStart: allowance.periodStart,
            periodEnd: allowance.periodEnd,
          },
        ),
      ]);

    return buildCreditCounterCheck({
      key,
      liveValueMicro,
      rebuiltValueMicro: workspaceFundedCreditsUsedMicro,
      turnCostMicro,
    });
  }

  private async checkMemberCounters({
    workspaceId,
    memberCredits,
    turnCostMicro,
  }: {
    workspaceId: string;
    memberCredits: MemberCreditsAllowance;
    turnCostMicro: number;
  }): Promise<MemberCreditsCounterChecks> {
    const [userWorkspaces, rebuiltValueByUserWorkspaceId] = await Promise.all([
      // A removed member's counter lives until its slice ends
      this.userWorkspaceRepository.find(workspaceId, {
        select: { id: true },
        withDeleted: true,
      }),
      this.usageAnalyticsService.getMemberCreditsUsedMicroByMemberForSlice({
        workspaceId,
        sliceStart: memberCredits.periodStart,
        sliceEnd: memberCredits.periodEnd,
      }),
    ]);

    const userWorkspaceIds = [
      ...new Set([
        ...userWorkspaces.map((userWorkspace) => userWorkspace.id),
        ...rebuiltValueByUserWorkspaceId.keys(),
      ]),
    ].sort((left, right) => left.localeCompare(right));

    const keys = userWorkspaceIds.map((userWorkspaceId) =>
      buildMemberAllowanceCounterKey({
        workspaceId,
        userWorkspaceId,
        periodStart: memberCredits.periodStart,
      }),
    );

    const liveValues = await this.readLiveValues(keys);

    const memberChecks = userWorkspaceIds
      .map((userWorkspaceId, index) => ({
        userWorkspaceId,
        ...buildCreditCounterCheck({
          key: keys[index],
          liveValueMicro: liveValues[index],
          rebuiltValueMicro:
            rebuiltValueByUserWorkspaceId.get(userWorkspaceId) ?? 0,
          turnCostMicro,
          memberCredits,
        }),
      }))
      .filter(
        (memberCheck) =>
          isDefined(memberCheck.liveValueMicro) ||
          memberCheck.rebuiltValueMicro !== 0,
      );

    return {
      ...memberCredits,
      memberChecks,
      idleMemberCount: userWorkspaceIds.length - memberChecks.length,
    };
  }

  // Plain reads: the quota read paths warm a cold key, which would store the rebuilt value and hide the drift under check
  private async readLiveValues(keys: string[]): Promise<(number | null)[]> {
    if (keys.length === 0) {
      return [];
    }

    const values = await this.cacheStorage.mget<number>(keys);

    return values.map((value) => value ?? null);
  }
}
