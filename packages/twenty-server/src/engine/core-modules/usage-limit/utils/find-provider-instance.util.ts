import { type DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

export const findProviderInstance = <TProvider>({
  discoveryService,
  providerClass,
}: {
  discoveryService: DiscoveryService;
  providerClass: abstract new (...args: never[]) => TProvider;
}): TProvider | null => {
  for (const wrapper of discoveryService.getProviders()) {
    const { instance } = wrapper;

    if (isDefined(instance) && instance instanceof providerClass) {
      return instance;
    }
  }

  return null;
};
