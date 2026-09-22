import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { SettingsApplicationHealthBanner } from '~/pages/settings/applications/components/SettingsApplicationHealthBanner';

const renderBanner = ({
  healthStatus = ApplicationHealthStatus.ERROR,
  hasAction = true,
}: {
  healthStatus?: ApplicationHealthStatus;
  hasAction?: boolean;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationHealthBanner
        healthStatus={healthStatus}
        title="Your key was revoked"
        description="Generate a new one from the provider dashboard."
        action={
          hasAction ? { label: 'Reconnect', onClick: jest.fn() } : undefined
        }
      />
    </I18nProvider>,
  );

describe('SettingsApplicationHealthBanner', () => {
  it('should use the action label reported by the app', () => {
    renderBanner({});

    expect(
      screen.getByRole('button', { name: /Reconnect/ }),
    ).toBeInTheDocument();
  });

  it('should render the title without a button when the app reports no action', () => {
    renderBanner({ hasAction: false });

    expect(screen.getByText('Your key was revoked')).toBeInTheDocument();
    expect(
      screen.getByText('Generate a new one from the provider dashboard.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([ApplicationHealthStatus.OK, ApplicationHealthStatus.UNKNOWN])(
    'should render nothing for %s',
    (healthStatus) => {
      renderBanner({ healthStatus });

      expect(
        screen.queryByText('Your key was revoked'),
      ).not.toBeInTheDocument();
    },
  );
});
