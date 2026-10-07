import { Injectable } from '@nestjs/common';

import {
  type AdminPanelUsageLimitDefaultDTO,
  type AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { fromUsageLimitEntityToFlat } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-flat.util';

@Injectable()
export class AdminPanelUsageLimitService {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findWorkspaceUsageLimits(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    const [usageLimits, isInTrialPeriod] = await Promise.all([
      this.usageLimitService.findAll(workspaceId),
      this.usageLimitQuotaService.isInTrialPeriod(workspaceId),
    ]);

    return {
      defaults: await this.buildDefaults({
        workspaceId,
        usageLimits,
        isInTrialPeriod,
      }),
      limits: usageLimits.map(fromUsageLimitEntityToDto),
    };
  }

  private async buildDefaults({
    workspaceId,
    usageLimits,
    isInTrialPeriod,
  }: {
    workspaceId: string;
    usageLimits: UsageLimitEntity[];
    isInTrialPeriod: boolean;
  }): Promise<AdminPanelUsageLimitDefaultDTO[]> {
    const getConfigValue = (key: NumericConfigVariableKey) =>
      this.twentyConfigService.get(key);

    const usageLimitDefaults = buildUsageLimitDefaultScopes({
      getConfigValue,
      isInTrialPeriod,
    });

    const consumedValues =
      await this.usageLimitQuotaService.readDefaultConsumedValues({
        workspaceId,
        usageLimitDefaults,
        usageLimits: usageLimits.map(fromUsageLimitEntityToFlat),
      });

    return usageLimitDefaults.map((usageLimitDefault, index) => {
      const overridingUsageLimit = usageLimits.find((usageLimit) =>
        doesUsageLimitRowSuppressDefault({
          scope: buildUsageLimitScope(usageLimit),
          usageLimitDefault,
        }),
      );

      return {
        resourceType: usageLimitDefault.resourceType,
        operationType: usageLimitDefault.operationType,
        spenderType: usageLimitDefault.spenderType,
        limitKind: usageLimitDefault.limitKind,
        periodCount: usageLimitDefault.periodCount,
        periodUnit: usageLimitDefault.periodUnit,
        unit: usageLimitDefault.unit,
        limitValue: usageLimitDefault.limitValue,
        consumedValue: consumedValues[index] ?? null,
        isTrialLimitValue: usageLimitDefault.isTrialLimitValue,
        isOverridable: usageLimitDefault.isOverridable,
        overriddenByUsageLimitId: overridingUsageLimit?.id ?? null,
      };
    });
  }
}
