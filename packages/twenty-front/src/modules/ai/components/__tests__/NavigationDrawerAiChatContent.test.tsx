import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ToastProvider } from 'twenty-ui/primitives/feedback';

import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  type AgentChatThread,
  AgentChatThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

let threads: AgentChatThread[] = [];

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({
    threads,
    hasNextPage: false,
    loading: false,
    fetchMoreRef: undefined,
  }),
}));
jest.mock('@/ai/hooks/useChatChannels', () => ({
  useChatChannels: () => ({ joinedChannels: [], browsableChannels: [] }),
}));
jest.mock('@/ai/hooks/useAiChatThreadClick', () => ({
  useAiChatThreadClick: () => ({ handleThreadClick: jest.fn() }),
}));
jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded', () => ({
  useIsNavigationDrawerContentExpanded: () => true,
}));
jest.mock('@/ai/components/AiChatChannelsMenu', () => ({
  AiChatChannelsMenu: () => null,
}));
jest.mock('@/ai/components/AiChatThreadFilterDropdown', () => ({
  AiChatThreadFilterDropdown: () => null,
}));
jest.mock('@/ai/components/AiChatThreadDeleteConfirmationModal', () => ({
  AiChatThreadDeleteConfirmationModal: () => null,
}));
jest.mock('@/ai/components/AiChatChannelDeleteConfirmationModal', () => ({
  AiChatChannelDeleteConfirmationModal: () => null,
}));
jest.mock('@/ai/hooks/useRenameChatThread', () => ({
  useRenameChatThread: () => ({ renameChatThread: jest.fn() }),
}));
jest.mock('@/ai/hooks/useChatThreadInboxActions', () => ({
  useChatThreadInboxActions: () => ({
    markChatThreadDone: jest.fn(),
    reopenChatThread: jest.fn(),
    snoozeChatThread: jest.fn(),
    assignChatThread: jest.fn(),
  }),
}));
jest.mock('@/ai/hooks/useDeleteChatThread', () => ({
  useDeleteChatThread: () => ({ deleteChatThread: jest.fn() }),
}));
jest.mock('@/ai/hooks/useChatChannelActions', () => ({
  useChatChannelActions: () => ({}),
}));

const buildThread = (
  id: string,
  title: string,
  overrides: Partial<AgentChatThread> = {},
): AgentChatThread =>
  ({
    __typename: 'AgentChatThread',
    id,
    title,
    channelId: null,
    workflowRunId: null,
    workflowStepId: null,
    ownerUserWorkspaceId: 'uw-tim',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    lastMessageAt: '2026-09-01T00:00:00.000Z',
    status: AgentChatThreadStatus.OPEN,
    mentionedUserWorkspaceIds: [],
    snoozedUntil: null,
    assigneeUserWorkspaceId: null,
    ...overrides,
  }) as AgentChatThread;

const renderContent = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <ToastProvider>
            <NavigationDrawerAiChatContent />
          </ToastProvider>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      userWorkspaceId: 'uw-tim',
    } as never);
  });

  it('opens on the inbox states rather than a flat list of chats', () => {
    threads = [
      buildThread('t1', 'Yesterday chat'),
      buildThread('t2', 'Older chat'),
    ];

    renderContent();

    expect(screen.getByText('Inbox')).toBeVisible();
    expect(screen.getByText('Open')).toBeVisible();
    expect(screen.getByText('Snoozed')).toBeVisible();
    expect(screen.getByText('Done')).toBeVisible();
    expect(screen.queryByText('Direct messages')).toBeNull();
    expect(screen.queryByText('Today')).toBeNull();
  });

  it('counts only what is waiting, leaving done without a running total', () => {
    threads = [
      buildThread('t1', 'Waiting on me'),
      buildThread('t2', 'Also waiting'),
      buildThread('t3', 'Finished', { status: AgentChatThreadStatus.DONE }),
    ];

    renderContent();

    expect(screen.getByText('· 2')).toBeVisible();
    expect(screen.queryByText('· 1')).toBeNull();
  });
});
