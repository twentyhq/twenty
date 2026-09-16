import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProfileDevicesSection } from '@/settings/profile/devices/components/SettingsProfileDevicesSection';
import { CurrentUserSessionsDocument } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const buildSession = (id: string, isCurrent: boolean) => ({
  __typename: 'UserSession',
  id,
  isCurrent,
  isImpersonating: false,
  userAgent: 'Mozilla/5.0 (Macintosh) Chrome/128.0',
  ipAddress: '127.0.0.1',
  lastActiveAt: new Date().toISOString(),
});

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [
    {
      request: { query: CurrentUserSessionsDocument },
      result: {
        data: {
          currentUserSessions: [
            buildSession('session-current', true),
            buildSession('session-other', false),
          ],
        },
      },
    },
  ],
});

describe('SettingsProfileDevicesSection', () => {
  it('displays a query error when no device sessions are available', async () => {
    const ErrorWrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: { query: CurrentUserSessionsDocument },
          error: new Error('Could not load devices'),
        },
      ],
    });

    render(
      <I18nProvider i18n={i18n}>
        <ThemeProvider colorScheme="light">
          <MemoryRouter>
            <SettingsProfileDevicesSection />
            <AppToaster />
          </MemoryRouter>
        </ThemeProvider>
      </I18nProvider>,
      { wrapper: ErrorWrapper },
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Could not load devices',
    );
    expect(screen.queryByText('Devices')).not.toBeInTheDocument();
  });

  it('keeps a session row mounted across a re-render of the section', async () => {
    const tree = (
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsProfileDevicesSection />
        </MemoryRouter>
      </I18nProvider>
    );

    const { rerender } = render(tree, { wrapper: Wrapper });

    expect(await screen.findByText('This device')).toBeVisible();
    const rowDropdownTrigger = screen.getByRole('button', { expanded: false });

    rerender(tree);

    expect(screen.getByRole('button', { expanded: false })).toBe(
      rowDropdownTrigger,
    );
  });
});
