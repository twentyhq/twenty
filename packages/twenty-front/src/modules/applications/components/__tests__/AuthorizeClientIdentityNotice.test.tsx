import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ComponentProps } from 'react';

import { AuthorizeClientIdentityNotice } from '@/applications/components/AuthorizeClientIdentityNotice';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';

const renderNotice = ({
  appName,
  wellKnownOAuthClient,
}: ComponentProps<typeof AuthorizeClientIdentityNotice>) =>
  render(
    <AuthorizeClientIdentityNotice
      appName={appName}
      wellKnownOAuthClient={wellKnownOAuthClient}
    />,
    {
      wrapper: ({ children }) => (
        <I18nProvider i18n={i18n}>{children}</I18nProvider>
      ),
    },
  );

describe('AuthorizeClientIdentityNotice', () => {
  it('names a verified client by its catalog name, not the name it registered', () => {
    renderNotice({
      appName: 'Claude (Work)',
      wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
    });

    expect(
      screen.getByText('Verified by Twenty as the official Claude'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Claude \(Work\)/)).not.toBeInTheDocument();
  });

  it('warns with the registered name when an unverified client borrows a known name', () => {
    renderNotice({ appName: 'Claude' });

    expect(
      screen.getByText(/This app calls itself Claude/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Verified by Twenty/)).not.toBeInTheDocument();
  });
});
