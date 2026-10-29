import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { ThemeProvider } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { SettingsLegacyAccountsRedirect } from '@/settings/app-preferences/components/SettingsLegacyAccountsRedirect';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

// jsdom has no Fetch API Request, which data routers build on every navigation
class TestRequest {
  url: string;
  signal?: AbortSignal;
  method = 'GET';

  constructor(url: string | URL, init?: { signal?: AbortSignal }) {
    this.url = url.toString();
    this.signal = init?.signal;
  }
}

const CurrentLocation = () => {
  const { pathname, search, hash } = useLocation();

  return <span>{`${pathname}${search}${hash}`}</span>;
};

const renderWithAppPreferences = (initialEntry: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <ThemeProvider colorScheme="light">
          <ToastProvider>
            <RouterProvider
              router={createMemoryRouter(
                [
                  {
                    element: (
                      <>
                        <ErrorMessageEffect />
                        <AppToaster />
                        <Outlet />
                      </>
                    ),
                    children: [
                      {
                        element: <SettingsLegacyAccountsRedirect />,
                        children: [
                          {
                            path: getSettingsPath(SettingsPath.Accounts),
                            element: <span>Legacy accounts page</span>,
                          },
                        ],
                      },
                      {
                        path: getSettingsPath(SettingsPath.AppPreferences),
                        element: <CurrentLocation />,
                      },
                    ],
                  },
                ],
                { initialEntries: [initialEntry] },
              )}
            />
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('SettingsLegacyAccountsRedirect with an OAuth error', () => {
  const originalRequest = globalThis.Request;

  beforeAll(() => {
    globalThis.Request = TestRequest as unknown as typeof Request;
  });

  afterAll(() => {
    globalThis.Request = originalRequest;
  });

  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
      ],
    });
  });

  it('forwards to app preferences, shows the error once and removes it from the URL', async () => {
    renderWithAppPreferences(
      '/settings/accounts?errorMessage=Sync%20failed&tab=apps#accounts',
    );

    expect(
      await screen.findByText('/settings/app-preferences?tab=apps#accounts'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Sync failed')).toHaveLength(1);
  });
});
