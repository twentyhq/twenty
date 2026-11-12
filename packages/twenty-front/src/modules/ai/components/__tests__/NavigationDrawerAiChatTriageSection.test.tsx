import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { setAgentChatSelectedChannelView } from '@/ai/testing/setAgentChatSelectedChannelView';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
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
  unreadOpenThreadCount: 0,
  needsInputThreadCount: 0,
  mentionThreadCount: 0,
  assignedToMeThreadCount: 0,
  assignedThreadCount: 0,
  unassignedThreadCount: 2,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

const renderTriage = ({
  path = '/inbox',
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

  it('keeps Open, Snoozed and Done in navigation', () => {
    renderTriage();

    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Needs input' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Assigned' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Mentions' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
    AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT,
    AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS,
    AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ME,
    AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ANYONE,
    AGENT_CHAT_THREAD_PRESET_FILTER.UNASSIGNED,
  ])('keeps Open current for the %s filter', (presetFilter) => {
    jotaiStore.set(agentChatSelectedThreadListSourceState.atom, {
      type: 'presetFilter',
      presetFilter,
    });

    renderTriage();

    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Snoozed' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('button', { name: 'Done' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks Snoozed as current while its conversations are shown', () => {
    jotaiStore.set(agentChatSelectedThreadListSourceState.atom, {
      type: 'presetFilter',
      presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED,
    });

    renderTriage();

    expect(screen.getByRole('button', { name: 'Snoozed' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Open' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks no status current outside the inbox', () => {
    renderTriage({ path: '/objects/companies' });

    expect(
      screen.queryByRole('button', { current: true }),
    ).not.toBeInTheDocument();
  });

  it('marks no status current while a channel is shown', () => {
    setAgentChatSelectedChannelView(jotaiStore, {
      channelId: 'sales',
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
      filter: AgentChatChannelThreadFilter.ANY,
    });

    renderTriage();

    expect(
      screen.queryByRole('button', { current: true }),
    ).not.toBeInTheDocument();
  });

  it('opens the inbox on the chosen status', async () => {
    renderTriage();

    await userEvent.click(screen.getByRole('button', { name: 'Snoozed' }));

    expect(jotaiStore.get(agentChatSelectedThreadListSourceState.atom)).toEqual(
      {
        type: 'presetFilter',
        presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED,
      },
    );
    expect(navigate).toHaveBeenCalledWith(AppPath.AiChatInbox, {
      threadId: null,
    });
  });
});
