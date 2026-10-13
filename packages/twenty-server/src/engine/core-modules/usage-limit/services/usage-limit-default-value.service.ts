import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { findCreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-provider.util';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

@Injectable()
export class UsageLimitDefaultValueService implements OnModuleInit {
  private creditAllowanceProvider: CreditAllowanceProvider;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  onModuleInit() {
    this.creditAllowanceProvider = findCreditAllowanceProvider(
      this.discoveryService,
    );
  }

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
      ({ values, trialValues }) =>
        !isUndefined(values?.[limitValueConfigVariable]) ||
        !isUndefined(trialValues?.[limitValueConfigVariable]),
    );

    if (!isSetByAPlan) {
      return instanceValue;
    }

    const subscriptionPlan =
      await this.creditAllowanceProvider.getSubscriptionPlan(workspaceId);

    if (!isDefined(subscriptionPlan)) {
      return instanceValue;
    }

    return getPlanLimitDefaultValue({
      usageLimitDefaultsByPlan,
      subscriptionPlan,
      limitValueConfigVariable,
      instanceValue,
    });
  }
}
