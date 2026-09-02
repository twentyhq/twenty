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
  // Every non-current row renders a Dropdown whose floating-ui reference ref
  // sets state on mount. If the row component were defined inline, each render
  // of the section would hand React a new component type and remount the row,
  // so its DOM node would not survive a re-render.
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
    // The dropdown trigger carries role="button" and wraps the icon button,
    // so take the outermost one: it is the floating-ui reference element.
    const [rowDropdownTrigger] = screen.getAllByRole('button');

    rerender(tree);

    expect(screen.getAllByRole('button')[0]).toBe(rowDropdownTrigger);
  });
});
