import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useInstalledBuiltInApps } from '@/settings/applications/hooks/useInstalledBuiltInApps';
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

const renderInstalledBuiltInAppIds = () =>
  renderHook(() => useInstalledBuiltInApps(), {
    wrapper,
  }).result.current.map((builtInApp) => builtInApp.id);

describe('useInstalledBuiltInApps', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isMicrosoftMessagingEnabledState.atom, true);
    jotaiStore.set(isImapSmtpCaldavEnabledState.atom, false);
  });

  it('returns the built-in account apps enabled on the server, then ChatGPT and Claude, when the flag is on', () => {
    setAppPreferencesFlag(true);

    expect(renderInstalledBuiltInAppIds()).toEqual([
      'google',
      'outlook',
      'chatgpt',
      'claude',
    ]);
  });

  it('returns no built-in app when the flag is off', () => {
    setAppPreferencesFlag(false);

    expect(renderInstalledBuiltInAppIds()).toEqual([]);
  });
});
