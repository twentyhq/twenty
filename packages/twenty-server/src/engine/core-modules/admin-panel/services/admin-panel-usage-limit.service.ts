import { Injectable } from '@nestjs/common';

import {
  type AdminPanelUsageLimitDefaultDTO,
  type AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { fromUsageLimitEntityToAdminPanelDto } from 'src/engine/core-modules/admin-panel/utils/from-usage-limit-entity-to-admin-panel-dto.util';
import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

@Injectable()
export class AdminPanelUsageLimitService {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findWorkspaceUsageLimits(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    const usageLimits = await this.usageLimitService.findAll(workspaceId);

    return {
      defaults: this.buildDefaults(usageLimits),
      limits: usageLimits.map(fromUsageLimitEntityToAdminPanelDto),
    };
  }

  private buildDefaults(
    usageLimits: UsageLimitEntity[],
  ): AdminPanelUsageLimitDefaultDTO[] {
    const getConfigValue = (key: NumericConfigVariableKey) =>
      this.twentyConfigService.get(key);

    return buildUsageLimitDefaultScopes({ getConfigValue }).map(
      (usageLimitDefault) => {
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
          meter: usageLimitDefault.meter,
          limitValue: usageLimitDefault.limitValue,
          isOverridable: usageLimitDefault.isOverridable,
          overriddenByUsageLimitId: overridingUsageLimit?.id ?? null,
        };
      },
    );
  }
}
