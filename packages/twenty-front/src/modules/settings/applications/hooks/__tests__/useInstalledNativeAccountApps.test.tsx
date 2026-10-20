import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useInstalledNativeAccountApps } from '@/settings/applications/hooks/useInstalledNativeAccountApps';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const setAppPreferencesFlag = (value: boolean) =>
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value }],
  });

const renderInstalledNativeAccountAppIds = () =>
  renderHook(() => useInstalledNativeAccountApps(), {
    wrapper,
  }).result.current.map((nativeAccountApp) => nativeAccountApp.id);

describe('useInstalledNativeAccountApps', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isMicrosoftMessagingEnabledState.atom, true);
    jotaiStore.set(isImapSmtpCaldavEnabledState.atom, false);
  });

  it('returns the native apps enabled on the server when the flag is on', () => {
    setAppPreferencesFlag(true);

    expect(renderInstalledNativeAccountAppIds()).toEqual(['google', 'outlook']);
  });

  it('returns no native app when the flag is off', () => {
    setAppPreferencesFlag(false);

    expect(renderInstalledNativeAccountAppIds()).toEqual([]);
  });
});
