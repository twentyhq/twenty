import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  type GetAgentChatOpenThreadsSummaryQuery,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const navigate = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigate,
}));

type OpenThreadsSummary =
  GetAgentChatOpenThreadsSummaryQuery['agentChatOpenThreadsSummary'];

const READ_SUMMARY: OpenThreadsSummary = {
  __typename: 'AgentChatOpenThreadsSummary',
  openThreadCount: 2,
  needsInputThreadCount: 0,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

const renderTriage = ({
  path = '/',
  summary = READ_SUMMARY,
}: {
  path?: string;
  summary?: OpenThreadsSummary;
} = {}) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MockedProvider
          mocks={[
            {
              request: { query: GetAgentChatOpenThreadsSummaryDocument },
              delay: 0,
              result: { data: { agentChatOpenThreadsSummary: summary } },
            },
          ]}
        >
          <MemoryRouter initialEntries={[path]}>
            <NavigationDrawerAiChatTriageSection />
          </MemoryRouter>
        </MockedProvider>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatTriageSection', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    navigate.mockClear();

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
      ],
    });
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI],
    });
  });

  it('counts every open chat and flags Open when one is unread', async () => {
    renderTriage({ summary: { ...READ_SUMMARY, hasUnreadOpenThread: true } });

    expect(
      await screen.findByRole('button', { name: /^Open\s*, unread · 2$/ }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('shows Open as read when every open chat is read', async () => {
    renderTriage();

    expect(
      await screen.findByRole('button', { name: 'Open · 2' }),
    ).toBeVisible();
  });

  it('marks the status the inbox shows as current', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );

    renderTriage({ path: '/inbox' });

    expect(screen.getByRole('button', { name: 'Snoozed' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Done' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('opens the inbox on the chosen status', async () => {
    renderTriage();

    await userEvent.click(screen.getByRole('button', { name: 'Snoozed' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    expect(navigate).toHaveBeenCalledWith(AppPath.AiChatInbox, {
      threadId: null,
    });
  });

  it('counts the open chats waiting on an answer under Needs input', async () => {
    renderTriage({ summary: { ...READ_SUMMARY, needsInputThreadCount: 1 } });

    expect(
      await screen.findByRole('button', { name: 'Needs input · 1' }),
    ).toBeVisible();
  });

  it('flags Mentions when a chat the member was mentioned in is unread', async () => {
    renderTriage({
      summary: { ...READ_SUMMARY, hasUnreadMentionThread: true },
    });

    expect(
      await screen.findByRole('button', { name: /^Mentions\s*, unread$/ }),
    ).toBeVisible();
  });

  it('opens the inbox on the chats the member was mentioned in', async () => {
    renderTriage();

    await userEvent.click(screen.getByRole('button', { name: 'Mentions' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    );
  });

  it('flags Assigned when a chat assigned to the member is unread', async () => {
    renderTriage({
      summary: { ...READ_SUMMARY, hasUnreadAssignedThread: true },
    });

    expect(
      await screen.findByRole('button', { name: /^Assigned\s*, unread$/ }),
    ).toBeVisible();
  });
});
