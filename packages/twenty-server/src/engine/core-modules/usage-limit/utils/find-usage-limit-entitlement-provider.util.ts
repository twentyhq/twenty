import { type DiscoveryService } from '@nestjs/core';

import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';
import { findProviderInstance } from 'src/engine/core-modules/usage-limit/utils/find-provider-instance.util';

export const findUsageLimitEntitlementProvider = (
  discoveryService: DiscoveryService,
): UsageLimitEntitlementProvider | null =>
  findProviderInstance({
    discoveryService,
    providerClass: UsageLimitEntitlementProvider,
  });
