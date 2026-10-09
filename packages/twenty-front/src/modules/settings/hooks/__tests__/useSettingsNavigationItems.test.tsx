import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';
import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  type Billing,
  FeatureFlagKey,
  OnboardingStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { IconApps, IconAt } from 'twenty-ui/icon';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({
  [SOURCE_LOCALE]: messages,
});
i18n.activate(SOURCE_LOCALE);

const mockCurrentUser = {
  id: 'fake-user-id',
  email: 'fake@email.com',
  supportUserHash: null,
  canAccessFullAdminPanel: false,
  canImpersonate: false,
  onboardingStatus: OnboardingStatus.COMPLETED,
  userVars: {},
  firstName: 'fake-first-name',
  lastName: 'fake-last-name',
  hasPassword: true,
};

const mockBilling: Billing = {
  isBillingEnabled: false,
  billingUrl: '',
  trialPeriods: [],
  __typename: 'Billing',
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider>
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    </JotaiProvider>
  </MockedProvider>
);

jest.mock('@/domain-manager/hooks/useRedirectToWorkspaceDomain', () => ({
  useRedirectToWorkspaceDomain: jest.fn().mockImplementation(() => ({
    redirectToWorkspaceDomain: jest.fn(),
  })),
}));

const setPermissionFlags = (permissionFlags: PermissionFlagType[]) => {
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
    isImpersonating: false,
  });
};

const getAccountsItem = () => {
  const { result } = renderHook(() => useSettingsNavigationItems(), {
    wrapper: Wrapper,
  });

  return result.current
    .find((section) => section.label === 'User')
    ?.items.find((item) => item.path === SettingsPath.Accounts);
};

describe('useSettingsNavigationItems', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentUserState.atom, mockCurrentUser);
    jotaiStore.set(billingState.atom, mockBilling);
  });

  it('should hide workspace settings when no permissions', () => {
    setPermissionFlags([]);

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );

    expect(workspaceSection?.items.every((item) => item.isHidden)).toBe(true);
  });

  it('should show workspace settings when has permissions', () => {
    setPermissionFlags([
      PermissionFlagType.WORKSPACE,
      PermissionFlagType.WORKSPACE_MEMBERS,
      PermissionFlagType.DATA_MODEL,
      PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      PermissionFlagType.ROLES,
      PermissionFlagType.SECURITY,
      PermissionFlagType.CONNECTED_ACCOUNTS,
    ]);

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );

    expect(workspaceSection?.items.some((item) => !item.isHidden)).toBe(true);
  });

  it('should hide billing navigation when billing is disabled', () => {
    setPermissionFlags([
      PermissionFlagType.WORKSPACE,
      PermissionFlagType.WORKSPACE_MEMBERS,
      PermissionFlagType.DATA_MODEL,
      PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      PermissionFlagType.ROLES,
      PermissionFlagType.SECURITY,
      PermissionFlagType.CONNECTED_ACCOUNTS,
    ]);

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );
    const billingItem = workspaceSection?.items.find(
      (item) => item.label === 'Billing',
    );

    expect(billingItem?.isHidden).toBe(true);
    expect(billingItem?.path).toBe(SettingsPath.Billing);
  });

  it('should hide billing navigation until billing config is loaded', () => {
    jotaiStore.set(billingState.atom, null);

    setPermissionFlags([
      PermissionFlagType.WORKSPACE,
      PermissionFlagType.WORKSPACE_MEMBERS,
      PermissionFlagType.DATA_MODEL,
      PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      PermissionFlagType.ROLES,
      PermissionFlagType.SECURITY,
      PermissionFlagType.CONNECTED_ACCOUNTS,
    ]);

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const workspaceSection = result.current.find(
      (section) => section.label === 'Workspace',
    );
    const billingItem = workspaceSection?.items.find(
      (item) => item.label === 'Billing',
    );

    expect(billingItem?.isHidden).toBe(true);
  });

  it('should show user section items regardless of permissions', () => {
    setPermissionFlags([]);

    const { result } = renderHook(() => useSettingsNavigationItems(), {
      wrapper: Wrapper,
    });

    const userSection = result.current.find(
      (section) => section.label === 'User',
    );
    expect(
      userSection?.items.filter((item) => !item.isHidden).length,
    ).toBeGreaterThan(0);
    expect(
      userSection?.items
        .filter((item) => item.path !== SettingsPath.Accounts)
        .every((item) => !item.isHidden),
    ).toBe(true);
  });

  it('should show Accounts with Emails and Calendars when app preferences are off', () => {
    setPermissionFlags([PermissionFlagType.CONNECTED_ACCOUNTS]);

    const accountsItem = getAccountsItem();

    expect(accountsItem?.label).toBe('Accounts');
    expect(accountsItem?.Icon).toBe(IconAt);
    expect(accountsItem?.subItems?.map((subItem) => subItem.path)).toEqual([
      SettingsPath.AccountsEmails,
      SettingsPath.AccountsCalendars,
    ]);
  });

  it('should show App preferences without sub-items when app preferences are on', () => {
    setPermissionFlags([PermissionFlagType.CONNECTED_ACCOUNTS]);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
      ],
    });

    const accountsItem = getAccountsItem();

    expect(accountsItem?.label).toBe('App preferences');
    expect(accountsItem?.Icon).toBe(IconApps);
    expect(accountsItem?.isHidden).toBe(false);
    expect(accountsItem?.subItems).toBeUndefined();
  });
});
