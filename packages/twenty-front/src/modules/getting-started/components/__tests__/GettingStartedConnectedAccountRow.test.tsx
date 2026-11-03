import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GettingStartedConnectedAccountRow } from '@/getting-started/components/GettingStartedConnectedAccountRow';
import { mockedDropdownConnectedAccount } from '@/settings/accounts/components/__stories__/mockedDropdownConnectedAccount';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const CurrentPathname = () => (
  <span data-testid="pathname">{useLocation().pathname}</span>
);

const renderConnectedAccountRow = ({
  isAppPreferencesEnabled,
}: {
  isAppPreferencesEnabled: boolean;
}) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: isAppPreferencesEnabled,
      },
    ],
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={['/getting-started']}>
          <GettingStartedConnectedAccountRow
            account={mockedDropdownConnectedAccount}
          />
          <CurrentPathname />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('GettingStartedConnectedAccountRow', () => {
  it.each([
    {
      isAppPreferencesEnabled: true,
      expectedPathname: '/settings/app-preferences/accounts/connected-account',
    },
    {
      isAppPreferencesEnabled: false,
      expectedPathname: '/settings/accounts',
    },
  ])(
    'opens the account settings from its chevron when app preferences are $isAppPreferencesEnabled',
    async ({ isAppPreferencesEnabled, expectedPathname }) => {
      renderConnectedAccountRow({ isAppPreferencesEnabled });

      expect(screen.getByText('account@example.com')).toBeVisible();
      expect(
        screen.queryByRole('button', { name: 'More options' }),
      ).not.toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Open account@example.com settings',
        }),
      );

      expect(screen.getByTestId('pathname')).toHaveTextContent(
        expectedPathname,
      );
    },
  );
});
