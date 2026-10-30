import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useIsGettingStartedEnabled } from '@/getting-started/hooks/useIsGettingStartedEnabled';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useIsGettingStartedEnabled', () => {
  it.each([
    { isFeatureFlagEnabled: true, isBillingEnabled: true, expected: true },
    { isFeatureFlagEnabled: true, isBillingEnabled: false, expected: false },
    { isFeatureFlagEnabled: false, isBillingEnabled: true, expected: false },
  ])(
    'returns $expected when the flag is $isFeatureFlagEnabled and billing is $isBillingEnabled',
    ({ isFeatureFlagEnabled, isBillingEnabled, expected }) => {
      jotaiStore.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          {
            key: FeatureFlagKey.IS_GETTING_STARTED_ENABLED,
            value: isFeatureFlagEnabled,
          },
        ],
      });
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
