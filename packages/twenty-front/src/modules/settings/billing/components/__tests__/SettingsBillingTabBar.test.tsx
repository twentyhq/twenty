import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingTabBar } from '@/settings/billing/components/SettingsBillingTabBar';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const renderTabBar = (permissionFlags: PermissionFlagType[]) => {
  jotaiStore.set(billingState.atom, {
    isBillingEnabled: true,
    billingUrl: '',
    trialPeriods: [],
    __typename: 'Billing',
  });
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    twoFactorAuthenticationMethodSummary: [],
    objectRecordsPermissions: [],
    isImpersonating: false,
  });

  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>
        <I18nProvider i18n={i18n}>
          <SettingsBillingTabBar />
        </I18nProvider>
      </MemoryRouter>
    </JotaiProvider>,
  );
};

const getTabTitles = () =>
  screen.queryAllByRole('link').map((tab) => tab.textContent);

describe('SettingsBillingTabBar', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should hide the limits tab without the workspace permission', () => {
    renderTabBar([PermissionFlagType.BILLING]);

    expect(getTabTitles()).toEqual(['Billing', 'Plans']);
  });

  it('should only show the limits tab without the billing permission', () => {
    renderTabBar([PermissionFlagType.WORKSPACE]);

    expect(getTabTitles()).toEqual(['Limits']);
  });

  it('should show every tab with both permissions', () => {
    renderTabBar([PermissionFlagType.BILLING, PermissionFlagType.WORKSPACE]);

    expect(getTabTitles()).toEqual(['Billing', 'Plans', 'Limits']);
  });
});
