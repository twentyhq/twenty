import { render, screen } from '@testing-library/react';

import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';

jest.mock('@/settings/applications/hooks/useStartAppConnection', () => ({
  useStartAppConnection: () => ({ startAppConnection: jest.fn() }),
}));

const renderCard = (logoUrl: string | null) =>
  render(
    <SettingsApplicationConnectCard
      applicationId="application-id"
      connectionProvider={{
        name: 'linkedin',
        type: 'custom',
        displayName: 'LinkedIn',
        logoUrl,
      }}
      title="Connect with LinkedIn"
      redirectLocation="/settings"
    />,
  );

describe('SettingsApplicationConnectCard', () => {
  it('should show the connection provider logo', () => {
    renderCard('https://example.com/linkedin.svg');

    expect(screen.getByRole('img', { name: 'LinkedIn' })).toBeInTheDocument();
  });

  it('should show no logo when the connection provider has none', () => {
    renderCard(null);

    expect(
      screen.queryByRole('img', { name: 'LinkedIn' }),
    ).not.toBeInTheDocument();
  });
});
