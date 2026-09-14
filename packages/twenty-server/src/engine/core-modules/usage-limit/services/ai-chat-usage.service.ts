import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsageDTO } from 'src/engine/core-modules/usage-limit/dtos/ai-chat-usage.dto';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@Injectable()
export class AiChatUsageService {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async findUsage({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AiChatUsageDTO | null> {
    const limits = findLimitsForSpender({
      limits: (await this.usageLimitService.findAll(workspaceId)).filter(
        (limit) =>
          limit.limitKind === 'quota' &&
          limit.resourceType === UsageResourceType.AI &&
          limit.meter === 'creditsUsedMicro',
      ),
      spender: { spenderType: 'userWorkspace', spenderId: userWorkspaceId },
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });
    const enforcedLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId,
        limits,
      });

    if (enforcedLimits.length === 0) {
      return this.usageLimitQuotaService.getAllowanceUsage(workspaceId);
    }

    const consumptionById =
      await this.usageLimitQuotaService.readLimitConsumptions({
        workspaceId,
        limits: enforcedLimits,
      });
    const usages = enforcedLimits.map((limit) => ({
      limitValue: limit.limitValue,
      consumedValue: consumptionById.get(limit.id)?.consumedValue ?? null,
      periodEnd: consumptionById.get(limit.id)?.periodEnd ?? null,
    }));

    // Several periods can apply simultaneously; surface the closest to exhaustion.
    const pressure = (usage: AiChatUsageDTO) =>
      usage.limitValue === 0
        ? Infinity
        : isDefined(usage.consumedValue)
          ? usage.consumedValue / usage.limitValue
          : -1;

    return usages.sort((left, right) => pressure(right) - pressure(left))[0];
  }
}
