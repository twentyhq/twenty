import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'twenty-ui/theme';

import { SettingsApplicationConnectedMembersSection } from '@/settings/applications/components/SettingsApplicationConnectedMembersSection';
import { type MockedResponse } from '@apollo/client/testing';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  RevokeWorkspaceApplicationAuthorizationDocument,
  WorkspaceApplicationAuthorizationsDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const APPLICATION_ID = 'application-acme';

const buildWorkspaceMember = ({
  userId,
  firstName,
  lastName,
}: {
  userId: string;
  firstName: string;
  lastName: string;
}): PartialWorkspaceMember => ({
  __typename: 'WorkspaceMember',
  id: `member-${userId}`,
  userId,
  userEmail: `${firstName.toLowerCase()}@acme.dev`,
  name: { __typename: 'FullName', firstName, lastName },
});

const buildAuthorizationsMock = (
  authorizations: { userId: string; applicationId: string }[],
) => ({
  request: {
    query: WorkspaceApplicationAuthorizationsDocument,
    variables: { applicationId: APPLICATION_ID },
  },
  result: {
    data: {
      workspaceApplicationAuthorizations: authorizations.map(
        ({ userId, applicationId }) => ({
          __typename: 'ApplicationAuthorization',
          id: `authorization-${userId}-${applicationId}`,
          applicationId,
          applicationName: 'Acme Notes',
          userId,
          lastUsedAt: new Date().toISOString(),
        }),
      ),
    },
  },
});

const renderSection = (apolloMocks: MockedResponse[]) =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <MemoryRouter>
          <SettingsApplicationConnectedMembersSection
            applicationId={APPLICATION_ID}
          />
          <AppToaster />
        </MemoryRouter>
      </ThemeProvider>
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        apolloMocks,
        onInitializeJotaiStore: (store) =>
          store.set(currentWorkspaceMembersState.atom, [
            buildWorkspaceMember({
              userId: 'user-jane',
              firstName: 'Jane',
              lastName: 'Doe',
            }),
            buildWorkspaceMember({
              userId: 'user-john',
              firstName: 'John',
              lastName: 'Smith',
            }),
          ]),
      }),
    },
  );

describe('SettingsApplicationConnectedMembersSection', () => {
  it('lists the connected members by name', async () => {
    renderSection([
      buildAuthorizationsMock([
        { userId: 'user-jane', applicationId: APPLICATION_ID },
        { userId: 'user-removed', applicationId: APPLICATION_ID },
      ]),
    ]);

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Unknown user')).toBeInTheDocument();
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('shows nothing when no member is connected', async () => {
    renderSection([buildAuthorizationsMock([])]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText('Connected members')).not.toBeInTheDocument();
  });

  it('removes a member once their access is revoked', async () => {
    renderSection([
      buildAuthorizationsMock([
        { userId: 'user-jane', applicationId: APPLICATION_ID },
      ]),
      {
        request: {
          query: RevokeWorkspaceApplicationAuthorizationDocument,
          variables: {
            applicationAuthorizationId: `authorization-user-jane-${APPLICATION_ID}`,
          },
        },
        result: {
          data: { revokeWorkspaceApplicationAuthorization: true },
        },
      },
      buildAuthorizationsMock([]),
    ]);

    await screen.findByText('Jane Doe');
    await userEvent.click(screen.getByRole('button', { name: 'More options' }));
    await userEvent.click(await screen.findByText('Revoke access'));

    expect(
      await within(await screen.findByRole('status')).findByText(
        'Acme Notes can no longer access the account of Jane Doe',
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText('Connected members')).not.toBeInTheDocument(),
    );
  });
});
