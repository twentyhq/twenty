import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatInboxSection } from '@/ai/components/NavigationDrawerAiChatInboxSection';
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
  unreadMentionThreadCount: 0,
  unreadAssignedThreadCount: 0,
};

const renderInboxSection = ({
  path = '/inbox',
  summary = READ_SUMMARY,
  visibleItemLimit,
}: {
  path?: string;
  summary?: OpenThreadsSummary;
  visibleItemLimit?: number;
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
            <NavigationDrawerAiChatInboxSection
              visibleItemLimit={visibleItemLimit}
            />
          </MemoryRouter>
        </MockedProvider>
      </I18nProvider>
    </JotaiProvider>,
  );

const expectInboxRowToHaveText = (name: RegExp, text: RegExp) =>
  waitFor(() =>
    expect(
      screen.getByRole('button', { name }).closest('.navigation-drawer-item'),
    ).toHaveTextContent(text),
  );

describe('NavigationDrawerAiChatInboxSection', () => {
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
    renderInboxSection({
      summary: { ...READ_SUMMARY, hasUnreadOpenThread: true },
    });

    await expectInboxRowToHaveText(
      /^Open\s*, unread$/,
      /^Open\s*, unread\s*2$/,
    );
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('shows Open as read when every open chat is read', async () => {
    renderInboxSection();

    await expectInboxRowToHaveText(/^Open$/, /^Open\s*2$/);
  });

  it('shows only Open until See more reveals the other statuses', async () => {
    renderInboxSection({ visibleItemLimit: 1 });

    await expectInboxRowToHaveText(/^Open$/, /^Open\s*2$/);
    expect(screen.queryByRole('button', { name: 'Snoozed' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'See more' }));

    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('marks the status the inbox shows as current', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );

    renderInboxSection({ path: '/inbox' });

    expect(screen.getByRole('button', { name: 'Snoozed' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Done' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('hides the statuses narrowing Open while another status is shown', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );

    renderInboxSection();

    expect(screen.queryByRole('button', { name: 'Mentions' })).toBeNull();
  });

  it('keeps the statuses narrowing Open while one of them is shown', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    );

    renderInboxSection();

    expect(screen.getByRole('button', { name: 'Mentions' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Assigned' })).toBeVisible();
  });

  it('hides the statuses narrowing Open outside the inbox', () => {
    renderInboxSection({ path: '/objects/companies' });

    expect(screen.queryByRole('button', { name: 'Mentions' })).toBeNull();
  });

  it('opens the inbox on the chosen status', async () => {
    renderInboxSection();

    await userEvent.click(screen.getByRole('button', { name: 'Snoozed' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    expect(navigate).toHaveBeenCalledWith(AppPath.AiChatInbox, {
      threadId: null,
    });
  });

  it('counts the open chats waiting on an answer in Needs input', async () => {
    renderInboxSection({
      summary: { ...READ_SUMMARY, needsInputThreadCount: 1 },
    });

    await expectInboxRowToHaveText(/^Needs input$/, /^Needs input\s*1$/);
  });

  it('keeps Needs input and its count in view outside the inbox', async () => {
    renderInboxSection({
      path: '/objects/companies',
      summary: { ...READ_SUMMARY, needsInputThreadCount: 3 },
    });

    await expectInboxRowToHaveText(/^Needs input$/, /^Needs input\s*3$/);
    expect(screen.queryByRole('button', { name: 'Mentions' })).toBeNull();
  });

  it('flags and counts Mentions when chats the member was mentioned in are unread', async () => {
    renderInboxSection({
      summary: {
        ...READ_SUMMARY,
        hasUnreadMentionThread: true,
        unreadMentionThreadCount: 2,
      },
    });

    await expectInboxRowToHaveText(
      /^Mentions\s*, unread$/,
      /^Mentions\s*, unread\s*2$/,
    );
  });

  it('keeps the statuses narrowing Open with unread chats in view outside the inbox', async () => {
    renderInboxSection({
      path: '/objects/companies',
      summary: {
        ...READ_SUMMARY,
        hasUnreadAssignedThread: true,
        unreadAssignedThreadCount: 1,
      },
    });

    await expectInboxRowToHaveText(
      /^Assigned\s*, unread$/,
      /^Assigned\s*, unread\s*1$/,
    );
    expect(screen.queryByRole('button', { name: 'Mentions' })).toBeNull();
  });

  it('opens the inbox on the chats the member was mentioned in', async () => {
    renderInboxSection();

    await userEvent.click(screen.getByRole('button', { name: 'Mentions' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    );
  });

  it('flags and counts Assigned when chats assigned to the member are unread', async () => {
    renderInboxSection({
      summary: {
        ...READ_SUMMARY,
        hasUnreadAssignedThread: true,
        unreadAssignedThreadCount: 3,
      },
    });

    await expectInboxRowToHaveText(
      /^Assigned\s*, unread$/,
      /^Assigned\s*, unread\s*3$/,
    );
  });
});
