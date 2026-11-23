import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'twenty-ui/theme';

import { SettingsProfileConnectedAppsSection } from '@/settings/profile/connected-apps/components/SettingsProfileConnectedAppsSection';
import {
  CurrentUserApplicationAuthorizationsDocument,
  RevokeApplicationAuthorizationDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const buildAuthorizationsMock = (applicationNames: string[]) => ({
  request: { query: CurrentUserApplicationAuthorizationsDocument },
  result: {
    data: {
      currentUserApplicationAuthorizations: applicationNames.map(
        (applicationName) => ({
          __typename: 'ApplicationAuthorization',
          id: `authorization-${applicationName}`,
          applicationId: `application-${applicationName}`,
          applicationName,
          lastUsedAt: new Date().toISOString(),
        }),
      ),
    },
  },
});

const renderSection = (
  Wrapper: ReturnType<typeof getJestMetadataAndApolloMocksWrapper>,
) =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <MemoryRouter>
          <SettingsProfileConnectedAppsSection />
          <AppToaster />
        </MemoryRouter>
      </ThemeProvider>
    </I18nProvider>,
    { wrapper: Wrapper },
  );

describe('SettingsProfileConnectedAppsSection', () => {
  it('lists the apps the user connected', async () => {
    renderSection(
      getJestMetadataAndApolloMocksWrapper({
        apolloMocks: [buildAuthorizationsMock(['Claude', 'ChatGPT'])],
      }),
    );

    expect(await screen.findByText('Claude')).toBeInTheDocument();
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    expect(screen.getByText('Connected apps')).toBeInTheDocument();
  });

  it('shows nothing when no app is connected', async () => {
    const { container } = renderSection(
      getJestMetadataAndApolloMocksWrapper({
        apolloMocks: [buildAuthorizationsMock([])],
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText('Connected apps')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('Claude');
  });

  it('removes an app once its access is revoked', async () => {
    renderSection(
      getJestMetadataAndApolloMocksWrapper({
        apolloMocks: [
          buildAuthorizationsMock(['Claude']),
          {
            request: {
              query: RevokeApplicationAuthorizationDocument,
              variables: {
                applicationAuthorizationId: 'authorization-Claude',
              },
            },
            result: { data: { revokeApplicationAuthorization: true } },
          },
          buildAuthorizationsMock([]),
        ],
      }),
    );

    await screen.findByText('Claude');
    await userEvent.click(screen.getByRole('button', { name: 'More options' }));
    await userEvent.click(await screen.findByText('Revoke access'));

    expect(
      await screen.findByText('Claude can no longer access your account'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Connected apps')).not.toBeInTheDocument();
  });
});
