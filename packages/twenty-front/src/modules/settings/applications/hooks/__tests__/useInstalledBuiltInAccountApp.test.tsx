import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { useInstalledBuiltInAccountApp } from '@/settings/applications/hooks/useInstalledBuiltInAccountApp';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderInstalledBuiltInAccountAppId = (
  builtInAccountAppId: string | undefined,
) =>
  renderHook(() => useInstalledBuiltInAccountApp(builtInAccountAppId), {
    wrapper,
  }).result.current?.id;

describe('useInstalledBuiltInAccountApp', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
      ],
    });
  });

  it('returns the installed built-in account app with that id', () => {
    expect(renderInstalledBuiltInAccountAppId('google')).toBe('google');
  });

  it('returns nothing for an id that is not an installed built-in account app', () => {
    expect(renderInstalledBuiltInAccountAppId('outlook')).toBeUndefined();
    expect(
      renderInstalledBuiltInAccountAppId(
        '20202020-6a7b-4c3d-8e4f-000000000001',
      ),
    ).toBeUndefined();
  });
});
