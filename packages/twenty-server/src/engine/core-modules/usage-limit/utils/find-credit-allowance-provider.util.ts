import { type DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';

export const findCreditAllowanceProvider = (
  discoveryService: DiscoveryService,
): CreditAllowanceProvider | null => {
  for (const wrapper of discoveryService.getProviders()) {
    const { instance } = wrapper;

    if (isDefined(instance) && instance instanceof CreditAllowanceProvider) {
      return instance;
    }
  }

  return null;
};
