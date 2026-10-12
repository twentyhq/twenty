import { useStore } from 'jotai';
import { useCallback } from 'react';

import { partnerCookieState } from '@/auth/states/partnerCookieState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isDefined } from 'twenty-shared/utils';

export const usePartner = () => {
  const store = useStore();

  const setPartner = useCallback(
    (partner: string | null) => {
      const { frontDomain } = store.get(domainConfigurationState.atom);

      store.set(partnerCookieState.atom, {
        ...(isDefined(partner) ? { partner } : {}),
        cookieAttributes: { domain: `.${frontDomain}` },
      });
    },
    [store],
  );

  return { setPartner };
};
