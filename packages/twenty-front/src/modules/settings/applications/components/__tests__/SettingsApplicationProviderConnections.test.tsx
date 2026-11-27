import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsApplicationProviderConnections } from '@/settings/applications/components/SettingsApplicationProviderConnections';

jest.mock(
  '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable',
  () => ({
    SettingsAppPreferencesConnectionsTable: () => null,
  }),
);

jest.mock('@/settings/applications/hooks/useStartAppConnection', () => ({
  useStartAppConnection: () => ({ startAppConnection: jest.fn() }),
}));

const EXISTING_CONNECTION = {
  id: 'connection-1',
  connectionProviderId: 'provider-1',
} as ConnectedAccount;

const renderProviderConnections = ({
  allowMultipleConnections,
}: {
  allowMultipleConnections: boolean;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationProviderConnections
        applicationId="app-1"
        connectionProvider={{
          name: 'whatsapp',
          type: 'custom',
          logoUrl: null,
          allowMultipleConnections,
        }}
        connections={[EXISTING_CONNECTION]}
        canStartAuthorization
        isLoading={false}
        connectTitle="Connect with WhatsApp"
        redirectLocation="/settings"
      />
    </I18nProvider>,
  );

describe('SettingsApplicationProviderConnections', () => {
  it('offers another connection when the provider allows several', () => {
    renderProviderConnections({ allowMultipleConnections: true });

    expect(
      screen.getByRole('button', { name: /Add connection/i }),
    ).toBeVisible();
  });

  it('hides Add connection once a single-connection provider has one', () => {
    renderProviderConnections({ allowMultipleConnections: false });

    expect(
      screen.queryByRole('button', { name: /Add connection/i }),
    ).not.toBeInTheDocument();
  });
});
