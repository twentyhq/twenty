import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

const setAppPreferencesFlag = (value: boolean) =>
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value }],
  });

const renderAccountsBreadcrumbLink = () =>
  renderHook(() => useAccountsSettingsBreadcrumbLink('Account'), { wrapper })
    .result.current;

describe('useAccountsSettingsBreadcrumbLink', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('keeps the legacy accounts link when app preferences are off', () => {
    setAppPreferencesFlag(false);

    expect(renderAccountsBreadcrumbLink()).toEqual({
      children: 'Account',
      href: '/settings/accounts',
    });
  });

  it('links to app preferences when they are on', () => {
    setAppPreferencesFlag(true);

    expect(renderAccountsBreadcrumbLink()).toEqual({
      children: 'Apps preferences',
      href: '/settings/app-preferences',
    });
  });
});
