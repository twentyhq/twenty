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
import { type AgentChatThread } from '~/generated-metadata/graphql';
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
jest.mock('@/ai/hooks/useChatThreadArchiveActions', () => ({
  useChatThreadArchiveActions: () => ({
    archiveChatThread: jest.fn(),
    unarchiveChatThread: jest.fn(),
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
  });

  it('lists the chats held directly under one undated section', () => {
    threads = [
      buildThread('t1', 'Yesterday chat', {
        lastMessageAt: '2026-09-01T00:00:00.000Z',
      }),
      buildThread('t2', 'Older chat', {
        lastMessageAt: '2025-01-01T00:00:00.000Z',
      }),
    ];

    renderContent();

    expect(screen.getByText('Direct messages')).toBeVisible();
    expect(screen.getByText('Yesterday chat')).toBeVisible();
    expect(screen.getByText('Older chat')).toBeVisible();
    expect(screen.queryByText('Today')).toBeNull();
    expect(screen.queryByText('Yesterday')).toBeNull();
    expect(screen.queryByText('Recents')).toBeNull();
  });

  it('leaves out the threads that belong to a channel or to a workflow run', () => {
    threads = [
      buildThread('t1', 'My own chat'),
      buildThread('t2', 'Channel chat', { channelId: 'channel-1' }),
      buildThread('t3', 'Run chat', { workflowRunId: 'run-1' }),
    ];

    renderContent();

    expect(screen.getByText('My own chat')).toBeVisible();
    expect(screen.queryByText('Channel chat')).toBeNull();
    expect(screen.queryByText('Run chat')).toBeNull();
  });
});
