import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

@Injectable()
export class UsageLimitDefaultValueService {
  constructor(
    private readonly billingCreditAllowanceService: BillingCreditAllowanceService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findDefaultLimitValue({
    workspaceId,
    limitValueConfigVariable,
  }: {
    workspaceId: string;
    limitValueConfigVariable: OptionalNumericConfigVariableKey;
  }): Promise<number | null> {
    const instanceValue =
      this.twentyConfigService.get(limitValueConfigVariable) ?? null;

    const usageLimitDefaultsByPlan = this.twentyConfigService.get(
      'USAGE_LIMIT_DEFAULTS_BY_PLAN',
    );

    const isSetByAPlan = Object.values(usageLimitDefaultsByPlan).some(
      (planUsageLimitDefaults) =>
        !isUndefined(planUsageLimitDefaults[limitValueConfigVariable]),
    );

    if (!isSetByAPlan) {
      return instanceValue;
    }

    const planKey =
      await this.billingCreditAllowanceService.getPlanKey(workspaceId);

    if (!isDefined(planKey)) {
      return instanceValue;
    }

    return getPlanLimitDefaultValue({
      usageLimitDefaultsByPlan,
      planKey,
      limitValueConfigVariable,
      instanceValue,
    });
  }
}
