import { type DiscoveryService } from '@nestjs/core';

import { SubscriptionPlanProvider } from 'src/engine/core-modules/usage-limit/interfaces/subscription-plan-provider.service';
import { NoSubscriptionPlanProvider } from 'src/engine/core-modules/usage-limit/services/no-subscription-plan-provider.service';
import { findProviderInstance } from 'src/engine/core-modules/usage-limit/utils/find-provider-instance.util';

export const findSubscriptionPlanProvider = (
  discoveryService: DiscoveryService,
): SubscriptionPlanProvider =>
  findProviderInstance({
    discoveryService,
    providerClass: SubscriptionPlanProvider,
  }) ?? new NoSubscriptionPlanProvider();
