import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type AgentChatChannel,
  type AgentChatChannelMember,
  AgentChatChannelMemberRole,
  AgentChatChannelVisibility,
  type AgentChatThread,
  AgentChatThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { AiChatChannelPage } from '~/pages/ai-chat/AiChatChannelPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const switchToNewChat = jest.fn();
const handleThreadClick = jest.fn();

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat }),
}));
jest.mock('@/ai/hooks/useChatChannelActions', () => ({
  useChatChannelActions: () => ({}),
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
jest.mock('@/ai/hooks/useAiChatThreadClick', () => ({
  useAiChatThreadClick: () => ({ handleThreadClick }),
}));
jest.mock('@/navigation/hooks/useNavigationDrawerExpanded', () => ({
  useNavigationDrawerExpanded: () => true,
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock('@/ai/components/AiChatChannelThreadPane', () => ({
  AiChatChannelThreadPane: ({ channelId }: { channelId: string }) => (
    <div>Chat pane for {channelId}</div>
  ),
}));

const CHANNEL: AgentChatChannel = {
  __typename: 'AgentChatChannel',
  id: '5e8c8a1c-6d17-4d75-8d47-3a6e1a2d0b11',
  name: 'Sales',
  description: 'Pipeline questions and deal research.',
  visibility: AgentChatChannelVisibility.PUBLIC,
  targetObjectMetadataId: null,
  targetRecordId: null,
  createdByUserWorkspaceId: 'uw-tim',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const MEMBER: AgentChatChannelMember = {
  __typename: 'AgentChatChannelMember',
  id: 'member-1',
  channelId: CHANNEL.id,
  userWorkspaceId: 'uw-tim',
  role: AgentChatChannelMemberRole.ADMIN,
  createdAt: '2026-09-01T00:00:00.000Z',
};

const buildThread = (
  id: string,
  title: string,
  channelId: string | null,
  lastMessage: Partial<
    Pick<
      AgentChatThread,
      | 'lastMessagePreview'
      | 'lastMessageRole'
      | 'lastMessageAuthorUserWorkspaceId'
    >
  > = {},
): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title,
  channelId,
  ownerUserWorkspaceId: 'uw-tim',
  status: AgentChatThreadStatus.OPEN,
  mentionedUserWorkspaceIds: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: '2026-09-01T00:00:00.000Z',
  lastMessagePreview: null,
  lastMessageRole: null,
  lastMessageAuthorUserWorkspaceId: null,
  ...lastMessage,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
});

const setStore = <TItem,>(
  key: 'agentChatThreads' | 'agentChatChannels' | 'agentChatChannelMembers',
  items: TItem[],
) => {
  jotaiStore.set(metadataStoreState.atomFamily(key), {
    current: items as object[],
    draft: items as object[],
    status: 'up-to-date',
  });
};

const renderPage = (path: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path={AppPath.AiChatChannel}
              element={<AiChatChannelPage />}
            />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatChannelPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    const tim = {
      id: 'member-tim',
      userWorkspaceId: 'uw-tim',
      name: { firstName: 'Tim', lastName: 'Apple' },
      userEmail: 'tim@apple.dev',
      locale: 'en',
      colorScheme: 'Light' as const,
    };

    jotaiStore.set(currentWorkspaceMemberState.atom, tim);
    jotaiStore.set(currentWorkspaceMembersState.atom, [tim]);
    setStore('agentChatChannels', [CHANNEL]);
    setStore('agentChatChannelMembers', [MEMBER]);
  });

  it('lists the threads of the channel beside the chat and marks the open one', () => {
    setStore('agentChatThreads', [
      buildThread('t1', 'Import companies', CHANNEL.id, {
        lastMessagePreview: 'Here is the import plan',
        lastMessageRole: 'assistant',
      }),
      buildThread('t4', 'Q3 forecast', CHANNEL.id, {
        lastMessagePreview: 'Can you pull the numbers?',
        lastMessageRole: 'user',
        lastMessageAuthorUserWorkspaceId: 'uw-tim',
      }),
      buildThread('t2', 'Private notes', null),
      buildThread('t3', 'Elsewhere', 'other-channel'),
    ]);
    jotaiStore.set(currentAiChatThreadState.atom, 't4');

    renderPage(`/chat/channels/${CHANNEL.id}/t4`);

    expect(screen.getByText('Sales')).toBeVisible();
    expect(
      screen.getByText('Pipeline questions and deal research.'),
    ).toBeVisible();
    expect(screen.getByText('Import companies')).toBeVisible();
    expect(screen.getByText('AI:')).toBeVisible();
    expect(screen.getByText(/Here is the import plan/)).toBeVisible();
    expect(screen.getByText('Tim Apple:')).toBeVisible();
    expect(screen.getByText(/Can you pull the numbers\?/)).toBeVisible();
    expect(screen.queryByText('Private notes')).toBeNull();
    expect(screen.queryByText('Elsewhere')).toBeNull();
    expect(screen.getByText(`Chat pane for ${CHANNEL.id}`)).toBeVisible();

    const openRow = screen.getByText('Q3 forecast').closest('[aria-current]');

    expect(openRow).not.toBeNull();
    expect(
      screen.getByText('Import companies').closest('[aria-current]'),
    ).toBeNull();
  });

  it('opens a thread of the list when its row is clicked', () => {
    const thread = buildThread('t1', 'Import companies', CHANNEL.id);

    setStore('agentChatThreads', [thread]);

    renderPage(`/chat/channels/${CHANNEL.id}`);

    screen.getByText('Import companies').click();

    expect(handleThreadClick).toHaveBeenCalledWith(thread);
  });

  it('shows an empty list, the chat pane and a new chat action for an empty channel', () => {
    setStore('agentChatThreads', []);

    renderPage(`/chat/channels/${CHANNEL.id}`);

    expect(screen.getByText('No chat in this channel yet')).toBeVisible();
    expect(screen.getByText(`Chat pane for ${CHANNEL.id}`)).toBeVisible();
    screen.getByRole('button', { name: /New chat/ }).click();
    expect(switchToNewChat).toHaveBeenCalledTimes(1);
  });

  it('tells the reader when the channel is not visible to them', () => {
    setStore('agentChatThreads', []);

    renderPage('/chat/channels/11111111-1111-4111-8111-111111111111');

    expect(screen.getByText('Channel not found')).toBeVisible();
  });
});
