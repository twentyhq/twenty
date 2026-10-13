import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type SubscriptionPlanProvider } from 'src/engine/core-modules/usage-limit/interfaces/subscription-plan-provider.service';
import { findSubscriptionPlanProvider } from 'src/engine/core-modules/usage-limit/utils/find-subscription-plan-provider.util';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

@Injectable()
export class UsageLimitDefaultValueService implements OnModuleInit {
  private subscriptionPlanProvider: SubscriptionPlanProvider;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  onModuleInit() {
    this.subscriptionPlanProvider = findSubscriptionPlanProvider(
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
      await this.subscriptionPlanProvider.getSubscriptionPlan(workspaceId);

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
