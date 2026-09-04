import { type DiscoveryService } from '@nestjs/core';

import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { findProviderInstance } from 'src/engine/core-modules/usage-limit/utils/find-provider-instance.util';

export const findCreditAllowanceProvider = (
  discoveryService: DiscoveryService,
): CreditAllowanceProvider | null =>
  findProviderInstance({
    discoveryService,
    providerClass: CreditAllowanceProvider,
  });
