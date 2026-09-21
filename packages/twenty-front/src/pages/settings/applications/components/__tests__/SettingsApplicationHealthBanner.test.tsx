import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { SettingsApplicationHealthBanner } from '~/pages/settings/applications/components/SettingsApplicationHealthBanner';

const renderBanner = ({
  healthStatus = ApplicationHealthStatus.ERROR,
  healthActionLabel,
}: {
  healthStatus?: ApplicationHealthStatus;
  healthActionLabel?: string | null;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationHealthBanner
        healthStatus={healthStatus}
        healthMessage="Your key was revoked"
        healthActionLabel={healthActionLabel}
        onAction={jest.fn()}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationHealthBanner', () => {
  it('should use the action label reported by the app', () => {
    renderBanner({ healthActionLabel: 'Reconnect' });

    expect(
      screen.getByRole('button', { name: /Reconnect/ }),
    ).toBeInTheDocument();
  });

  it('should fall back to Configure when the app reports no action label', () => {
    renderBanner({});

    expect(
      screen.getByRole('button', { name: /Configure/ }),
    ).toBeInTheDocument();
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
