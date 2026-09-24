import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from 'twenty-shared/utils';

import {
  type AdminPanelUsageLimitDefaultDTO,
  type AdminPanelUsageLimitDTO,
  type AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

@Injectable()
export class AdminPanelUsageLimitService {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findWorkspaceUsageLimits(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    const [usageLimits, isIntraWorkspaceLimitEntitled] = await Promise.all([
      this.usageLimitService.findAll(workspaceId),
      this.usageLimitEntitlementService.isIntraWorkspaceLimitEntitled(
        workspaceId,
      ),
    ]);

    return {
      defaults: this.buildDefaults(usageLimits),
      limits: usageLimits.map((usageLimit) =>
        this.buildLimit({ usageLimit, isIntraWorkspaceLimitEntitled }),
      ),
    };
  }

  async buildAdminPanelUsageLimit({
    workspaceId,
    usageLimit,
  }: {
    workspaceId: string;
    usageLimit: UsageLimitEntity;
  }): Promise<AdminPanelUsageLimitDTO> {
    return this.buildLimit({
      usageLimit,
      isIntraWorkspaceLimitEntitled:
        await this.usageLimitEntitlementService.isIntraWorkspaceLimitEntitled(
          workspaceId,
        ),
    });
  }

  private buildDefaults(
    usageLimits: UsageLimitEntity[],
  ): AdminPanelUsageLimitDefaultDTO[] {
    const getConfigValue = (key: NumericConfigVariableKey) =>
      this.twentyConfigService.get(key);

    return buildUsageLimitDefaultScopes({ getConfigValue }).map(
      (usageLimitDefault) => {
        // Period-blind, like the builders: a row on another period still drops
        // this default, so naming it here is what keeps the table's claim and
        // what actually caps the workspace the same statement.
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
          limitValueConfigVariable: usageLimitDefault.limitValueConfigVariable,
          isOverridable: usageLimitDefault.isOverridable,
          overriddenByUsageLimitId: overridingUsageLimit?.id ?? null,
        };
      },
    );
  }

  private buildLimit({
    usageLimit,
    isIntraWorkspaceLimitEntitled,
  }: {
    usageLimit: UsageLimitEntity;
    isIntraWorkspaceLimitEntitled: boolean;
  }): AdminPanelUsageLimitDTO {
    return {
      id: usageLimit.id,
      resourceType: usageLimit.resourceType,
      operationType: usageLimit.operationType,
      spenderType: usageLimit.spenderType,
      spenderId: isNonEmptyString(usageLimit.spenderId)
        ? usageLimit.spenderId
        : null,
      limitKind: usageLimit.limitKind,
      periodCount: usageLimit.periodCount,
      periodUnit: usageLimit.periodUnit,
      meter: usageLimit.meter,
      limitValue: usageLimit.limitValue,
      burstValue: usageLimit.burstValue,
      isEnforcedOnCurrentPlan: this.isEnforcedOnCurrentPlan({
        spenderType: usageLimit.spenderType,
        isIntraWorkspaceLimitEntitled,
      }),
      createdAt: usageLimit.createdAt,
      updatedAt: usageLimit.updatedAt,
    };
  }

  // findEnforceableLimits drops an intra-workspace row on a workspace without the
  // entitlement. It never touches declared defaults, so the instance default is
  // what applies instead and this only means anything about a stored override.
  private isEnforcedOnCurrentPlan({
    spenderType,
    isIntraWorkspaceLimitEntitled,
  }: {
    spenderType: UsageLimitEntity['spenderType'];
    isIntraWorkspaceLimitEntitled: boolean;
  }): boolean {
    return (
      !isIntraWorkspaceScoped(spenderType) || isIntraWorkspaceLimitEntitled
    );
  }
}
