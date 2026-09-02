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
