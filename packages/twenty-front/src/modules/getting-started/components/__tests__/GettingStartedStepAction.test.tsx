import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type GettingStartedStepDefinition,
  GettingStartedStepActionKey,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const CHAT_THREAD_ID = '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90';

const WORKSPACE_INVITATIONS_MOCK: MockedResponse = {
  request: { query: GetWorkspaceInvitationsDocument },
  result: {
    data: {
      findWorkspaceInvitations: ['marc@acme.com', 'sam@acme.com'].map(
        (email, index) => ({
          __typename: 'WorkspaceInvitation',
          id: `20202020-0000-4000-8000-00000000010${index}`,
          email,
          roleId: null,
          expiresAt: '2024-03-20T12:00:00.000Z',
        }),
      ),
    },
  },
};

const CurrentPathname = () => (
  <span data-testid="pathname">{useLocation().pathname}</span>
);

const findStepDefinition = (actionKey: GettingStartedStepActionKey) => {
  const stepDefinition = mockGettingStartedStepDefinitions.find(
    (mockStepDefinition) => mockStepDefinition.actionKey === actionKey,
  );

  if (stepDefinition === undefined) {
    throw new Error(`Missing mock step ${actionKey}`);
  }

  return stepDefinition;
};

const renderDoneStepAction = (stepDefinition: GettingStartedStepDefinition) =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MockedProvider mocks={[WORKSPACE_INVITATIONS_MOCK]}>
          <MemoryRouter initialEntries={['/getting-started']}>
            <MemoryRouterAppNavigatorProvider>
              <GettingStartedStepAction
                stepDefinition={stepDefinition}
                isCompleted
              />
              <CurrentPathname />
            </MemoryRouterAppNavigatorProvider>
          </MemoryRouter>
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );

describe('GettingStartedStepAction once done', () => {
  it('sums up the invitations instead of the form and opens the members settings', async () => {
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
      { ...mockedWorkspaceMemberData, id: 'teammate' },
    ]);

    renderDoneStepAction(
      findStepDefinition(GettingStartedStepActionKey.INVITE_TEAM),
    );

    const invitationsCard = await screen.findByRole('button', {
      name: /3 teammates invited/,
    });

    expect(invitationsCard).toHaveTextContent('1 joined · 2 pending');
    expect(
      screen.queryByRole('textbox', { name: 'Teammate email 1' }),
    ).not.toBeInTheDocument();

    await userEvent.click(invitationsCard);

    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/settings/members',
    );
  });

  it('shows the import thread instead of the upload', () => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(CHAT_THREAD_ID), {
      __typename: 'AgentChatThread',
      id: CHAT_THREAD_ID,
      title: 'Import HubSpot contacts',
      lastActivityAt: new Date().toISOString(),
    });

    renderDoneStepAction({
      ...findStepDefinition(GettingStartedStepActionKey.IMPORT_DATA),
      doneChatThreadId: CHAT_THREAD_ID,
    });

    expect(
      screen.queryByRole('button', { name: 'Upload file' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Import HubSpot contacts/ }),
    ).toHaveTextContent('Last update:');
  });

  it('falls back to the step title for a prompt thread that is not loaded', () => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(CHAT_THREAD_ID), null);

    renderDoneStepAction({
      ...findStepDefinition(GettingStartedStepActionKey.FOLLOW_UP_DEALS),
      doneChatThreadId: CHAT_THREAD_ID,
    });

    expect(
      screen.queryByRole('group', { name: 'Follow-up instructions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Follow up on closing deals' }),
    ).toBeVisible();
  });

  it.each([
    GettingStartedStepActionKey.IMPORT_DATA,
    GettingStartedStepActionKey.FOLLOW_UP_DEALS,
  ])('shows no action on a done %s step without a thread', (actionKey) => {
    renderDoneStepAction(findStepDefinition(actionKey));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
