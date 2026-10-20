import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsNativeApplicationDetails } from '~/pages/settings/applications/SettingsNativeApplicationDetails';

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const mockedUseIsFeatureEnabled = useIsFeatureEnabled as jest.MockedFunction<
  typeof useIsFeatureEnabled
>;

jest.mock('@/settings/components/SettingsPageContainer', () => ({
  SettingsPageContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

const CurrentLocation = () => {
  const location = useLocation();

  return (
    <span data-testid="location">{`${location.pathname}${location.hash}`}</span>
  );
};

const renderDetailPage = (nativeAccountAppId: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter
          initialEntries={[
            `/settings/applications/native/${nativeAccountAppId}`,
          ]}
        >
          <Routes>
            <Route
              path="/settings/applications/native/:nativeAccountAppId"
              element={<SettingsNativeApplicationDetails />}
            />
            <Route
              path="/settings/applications"
              element={<CurrentLocation />}
            />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('SettingsNativeApplicationDetails', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockedUseIsFeatureEnabled.mockReturnValue(true);
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isGoogleCalendarEnabledState.atom, true);
  });

  it('shows the native app name and description', () => {
    renderDetailPage('google');

    expect(screen.getByText('Gmail and Calendar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sync emails and calendar events from your Google accounts.',
      ),
    ).toBeInTheDocument();
  });

  it('redirects to installed applications when the feature flag is off', () => {
    mockedUseIsFeatureEnabled.mockReturnValue(false);

    renderDetailPage('google');

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/settings/applications#installed',
    );
  });

  it('redirects to installed applications for an unknown native app', () => {
    renderDetailPage('unknown');

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/settings/applications#installed',
    );
  });

  it('redirects to installed applications when the provider is disabled on the server', () => {
    renderDetailPage('outlook');

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/settings/applications#installed',
    );
  });
});
