import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { billingState } from '@/client-config/states/billingState';
import { useIsGettingStartedEnabled } from '@/getting-started/hooks/useIsGettingStartedEnabled';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { mockedClientConfig } from '~/testing/mock-data/config';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useIsGettingStartedEnabled', () => {
  it.each([
    { isBillingEnabled: true, expected: true },
    { isBillingEnabled: false, expected: false },
  ])(
    'returns $expected when billing is $isBillingEnabled',
    ({ isBillingEnabled, expected }) => {
      jotaiStore.set(billingState.atom, {
        ...mockedClientConfig.billing,
        isBillingEnabled,
      });

      const { result } = renderHook(() => useIsGettingStartedEnabled(), {
        wrapper: Wrapper,
      });

      expect(result.current).toBe(expected);
    },
  );
});
