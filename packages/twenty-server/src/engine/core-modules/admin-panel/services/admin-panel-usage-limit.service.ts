import { Injectable } from '@nestjs/common';

import {
  type AdminPanelUsageLimitDefaultDTO,
  type AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitDefaultValueService } from 'src/engine/core-modules/usage-limit/services/usage-limit-default-value.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@Injectable()
export class AdminPanelUsageLimitService {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly usageLimitDefaultValueService: UsageLimitDefaultValueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findWorkspaceUsageLimits(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    const [usageLimits, defaultLimitValues] = await Promise.all([
      this.usageLimitService.findAll(workspaceId),
      this.findDefaultLimitValues(workspaceId),
    ]);

    return {
      defaults: this.buildDefaults({ usageLimits, defaultLimitValues }),
      limits: usageLimits.map(fromUsageLimitEntityToDto),
    };
  }

  private async findDefaultLimitValues(
    workspaceId: string,
  ): Promise<Map<OptionalNumericConfigVariableKey, number | null>> {
    const limitValueConfigVariables = new Set(
      Object.values(UsageResourceType).flatMap((resourceType) =>
        findUsageLimitDefaults({ resourceType }).map(
          ({ limitValueConfigVariable }) => limitValueConfigVariable,
        ),
      ),
    );

    return new Map(
      await Promise.all(
        [...limitValueConfigVariables].map(
          async (
            limitValueConfigVariable,
          ): Promise<[OptionalNumericConfigVariableKey, number | null]> => [
            limitValueConfigVariable,
            await this.usageLimitDefaultValueService.findDefaultLimitValue({
              workspaceId,
              limitValueConfigVariable,
            }),
          ],
        ),
      ),
    );
  }

  private buildDefaults({
    usageLimits,
    defaultLimitValues,
  }: {
    usageLimits: UsageLimitEntity[];
    defaultLimitValues: Map<OptionalNumericConfigVariableKey, number | null>;
  }): AdminPanelUsageLimitDefaultDTO[] {
    const getConfigValue = <TKey extends OptionalNumericConfigVariableKey>(
      key: TKey,
    ) => this.twentyConfigService.get(key);

    return buildUsageLimitDefaultScopes({
      getConfigValue,
      getDefaultLimitValue: (limitValueConfigVariable) =>
        defaultLimitValues.get(limitValueConfigVariable) ?? null,
    }).map((usageLimitDefault) => {
      const overridingUsageLimit = usageLimits.find((usageLimit) =>
        doesUsageLimitRowSuppressDefault({
          scope: buildUsageLimitScope(usageLimit),
          usageLimitDefault: {
            ...usageLimitDefault,
            operationTypes: [usageLimitDefault.operationType],
          },
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
        isOverridable: usageLimitDefault.isOverridable,
        overriddenByUsageLimitId: overridingUsageLimit?.id ?? null,
      };
    });
  }
}
