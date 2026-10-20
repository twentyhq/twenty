import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';
import { NATIVE_ACCOUNT_APPS } from '@/settings/app-preferences/constants/NativeAccountApps';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { SettingsApplicationsInstalledTab } from '~/pages/settings/applications/tabs/SettingsApplicationsInstalledTab';

jest.mock('@/applications/hooks/useInstalledApplications', () => ({
  useInstalledApplications: jest.fn(),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

jest.mock('@/settings/app-preferences/hooks/useEnabledNativeAccountApps', () => ({
  useEnabledNativeAccountApps: jest.fn(),
}));

const mockedUseInstalledApplications =
  useInstalledApplications as jest.MockedFunction<
    typeof useInstalledApplications
  >;

const mockedUseIsFeatureEnabled = useIsFeatureEnabled as jest.MockedFunction<
  typeof useIsFeatureEnabled
>;

const mockedUseEnabledNativeAccountApps =
  useEnabledNativeAccountApps as jest.MockedFunction<
    typeof useEnabledNativeAccountApps
  >;

const STANDARD_APPLICATION: ApplicationWithoutRelation = {
  id: 'standard-application-id',
  name: 'Standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const OAUTH_APPLICATION: ApplicationWithoutRelation = {
  id: 'oauth-application-id',
  name: 'Zapier',
  universalIdentifier: 'oauth-application-universal-identifier',
  applicationRegistration: {
    id: 'oauth-registration-id',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  },
};

const NPM_APPLICATION: ApplicationWithoutRelation = {
  id: 'npm-application-id',
  name: 'Acme Sync',
  description: 'Keeps Acme in sync',
  universalIdentifier: 'npm-application-universal-identifier',
  applicationRegistration: {
    id: 'npm-registration-id',
    sourceType: ApplicationRegistrationSourceType.NPM,
  },
};

const GOOGLE_AND_OUTLOOK_APPS = NATIVE_ACCOUNT_APPS.filter(
  (nativeAccountApp) => nativeAccountApp.id !== 'imap',
);

const renderInstalledTab = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SettingsApplicationsInstalledTab />
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SettingsApplicationsInstalledTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseInstalledApplications.mockReturnValue([
      OAUTH_APPLICATION,
      NPM_APPLICATION,
      STANDARD_APPLICATION,
    ]);
    mockedUseEnabledNativeAccountApps.mockReturnValue({
      enabledNativeAccountApps: GOOGLE_AND_OUTLOOK_APPS,
    });
  });

  it('lists enabled native apps as built-in apps linking to their detail page when the flag is on', () => {
    mockedUseIsFeatureEnabled.mockReturnValue(true);

    renderInstalledTab();

    const gmailRowLink = screen.getByRole('link', {
      name: /Gmail and Calendar/,
    });

    expect(gmailRowLink).toHaveAttribute(
      'href',
      '/settings/applications/native/google',
    );
    expect(gmailRowLink).toHaveTextContent('Built-in');
    expect(gmailRowLink).toHaveTextContent(
      'Sync emails and calendar events from your Google accounts.',
    );
    expect(screen.getByRole('link', { name: /Outlook/ })).toHaveAttribute(
      'href',
      '/settings/applications/native/outlook',
    );
    expect(screen.queryByText('IMAP')).not.toBeInTheDocument();
  });

  it('hides native apps when the flag is off', () => {
    mockedUseIsFeatureEnabled.mockReturnValue(false);

    renderInstalledTab();

    expect(screen.getByText('Acme Sync')).toBeInTheDocument();
    expect(screen.queryByText('Gmail and Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('Outlook')).not.toBeInTheDocument();
  });

  it('shows native apps even when no application is installed', () => {
    mockedUseIsFeatureEnabled.mockReturnValue(true);
    mockedUseInstalledApplications.mockReturnValue([]);

    renderInstalledTab();

    expect(screen.getByText('Gmail and Calendar')).toBeInTheDocument();
  });

  it('filters native apps with the search input', async () => {
    mockedUseIsFeatureEnabled.mockReturnValue(true);

    renderInstalledTab();

    await userEvent.type(
      screen.getByPlaceholderText('Search an application'),
      'microsoft',
    );

    expect(screen.getByText('Outlook')).toBeInTheDocument();
    expect(screen.queryByText('Gmail and Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('Acme Sync')).not.toBeInTheDocument();
  });

  it('places native apps right after the standard app and before other apps', () => {
    mockedUseIsFeatureEnabled.mockReturnValue(true);

    renderInstalledTab();

    const rowHrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(rowHrefs).toEqual([
      '/settings/applications/standard-application-id',
      '/settings/applications/native/google',
      '/settings/applications/native/outlook',
      '/settings/applications/npm-application-id',
      '/settings/applications/oauth-application-id',
    ]);
  });
});
