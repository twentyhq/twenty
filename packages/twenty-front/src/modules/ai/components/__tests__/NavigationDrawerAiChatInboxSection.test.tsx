import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
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

const expectInboxRowToHaveText = ({
  name,
  text,
}: {
  name: RegExp;
  text: RegExp;
}) =>
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

    await expectInboxRowToHaveText({
      name: /^Open\s*, unread$/,
      text: /^Open\s*, unread\s*2$/,
    });
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('shows Open as read when every open chat is read', async () => {
    renderInboxSection();

    await expectInboxRowToHaveText({ name: /^Open$/, text: /^Open\s*2$/ });
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

  it('keeps personal filters visible while Snoozed is shown', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );

    renderInboxSection();

    expect(screen.getByRole('button', { name: 'Mentions' })).toBeVisible();
  });

  it('marks Mentions as current without hiding the other filters', () => {
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

  it('keeps personal filters visible outside the inbox', () => {
    renderInboxSection({ path: '/objects/companies' });

    expect(screen.getByRole('button', { name: 'Mentions' })).toBeVisible();
  });

  it('counts the open chats waiting on an answer in Needs input', async () => {
    renderInboxSection({
      summary: { ...READ_SUMMARY, needsInputThreadCount: 1 },
    });

    await expectInboxRowToHaveText({
      name: /^Needs input$/,
      text: /^Needs input\s*1$/,
    });
  });

  it('keeps Needs input and its count in view outside the inbox', async () => {
    renderInboxSection({
      path: '/objects/companies',
      summary: { ...READ_SUMMARY, needsInputThreadCount: 3 },
    });

    await expectInboxRowToHaveText({
      name: /^Needs input$/,
      text: /^Needs input\s*3$/,
    });
    expect(screen.getByRole('button', { name: 'Mentions' })).toBeVisible();
  });

  it('flags and counts Mentions when chats the member was mentioned in are unread', async () => {
    renderInboxSection({
      summary: {
        ...READ_SUMMARY,
        hasUnreadMentionThread: true,
        unreadMentionThreadCount: 2,
      },
    });

    await expectInboxRowToHaveText({
      name: /^Mentions\s*, unread$/,
      text: /^Mentions\s*, unread\s*2$/,
    });
  });

  it('preserves unread counts outside the inbox', async () => {
    renderInboxSection({
      path: '/objects/companies',
      summary: {
        ...READ_SUMMARY,
        hasUnreadAssignedThread: true,
        unreadAssignedThreadCount: 1,
      },
    });

    await expectInboxRowToHaveText({
      name: /^Assigned\s*, unread$/,
      text: /^Assigned\s*, unread\s*1$/,
    });
    expect(screen.getByRole('button', { name: 'Mentions' })).toBeVisible();
  });

  it('flags and counts Assigned when chats assigned to the member are unread', async () => {
    renderInboxSection({
      summary: {
        ...READ_SUMMARY,
        hasUnreadAssignedThread: true,
        unreadAssignedThreadCount: 3,
      },
    });

    await expectInboxRowToHaveText({
      name: /^Assigned\s*, unread$/,
      text: /^Assigned\s*, unread\s*3$/,
    });
  });
});
