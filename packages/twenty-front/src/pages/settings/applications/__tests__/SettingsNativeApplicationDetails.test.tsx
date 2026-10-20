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
import { SettingsNativeApplicationDetails } from '~/pages/settings/applications/SettingsNativeApplicationDetails';

const mockIsFeatureEnabled = jest.fn(() => true);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsFeatureEnabled(),
}));

jest.mock('@/settings/components/SettingsPageContainer', () => ({
  SettingsPageContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({
    secondaryBar,
    children,
  }: {
    secondaryBar?: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {secondaryBar}
      {children}
    </>
  ),
}));

jest.mock('@/settings/components/layout/SettingsTabBar', () => ({
  SettingsTabBar: ({ tabs }: { tabs: { id: string; title: string }[] }) => (
    <div role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} role="tab">
          {tab.title}
        </button>
      ))}
    </div>
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
            <Route path="/settings/applications" element={<CurrentLocation />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('SettingsNativeApplicationDetails', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockIsFeatureEnabled.mockReturnValue(true);
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isGoogleCalendarEnabledState.atom, true);
  });

  it('shows the native app overview with only a General tab', () => {
    renderDetailPage('google');

    expect(screen.getByText('Gmail and Calendar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sync emails and calendar events from your Google accounts.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /uninstall/i }),
    ).not.toBeInTheDocument();
  });

  it('redirects to installed applications when the feature flag is off', () => {
    mockIsFeatureEnabled.mockReturnValue(false);

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
