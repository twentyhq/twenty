import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
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
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { AiChatChannelPage } from '~/pages/ai-chat/AiChatChannelPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const switchToNewChat = jest.fn();

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
  useAiChatThreadClick: () => ({ handleThreadClick: jest.fn() }),
}));
jest.mock('@/navigation/hooks/useNavigationDrawerExpanded', () => ({
  useNavigationDrawerExpanded: () => true,
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const CHANNEL: AgentChatChannel = {
  __typename: 'AgentChatChannel',
  id: '5e8c8a1c-6d17-4d75-8d47-3a6e1a2d0b11',
  name: 'Sales',
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
): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title,
  channelId,
  ownerUserWorkspaceId: 'uw-tim',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: '2026-09-01T00:00:00.000Z',
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

const renderPage = (channelId: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/chat/channels/${channelId}`]}>
          <Routes>
            <Route
              path="/chat/channels/:channelId"
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
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'member-tim',
      userWorkspaceId: 'uw-tim',
      name: { firstName: 'Tim', lastName: 'Apple' },
      userEmail: 'tim@apple.dev',
      locale: 'en',
      colorScheme: 'Light',
    });
    setStore('agentChatChannels', [CHANNEL]);
    setStore('agentChatChannelMembers', [MEMBER]);
  });

  it('lists only the threads of the channel', () => {
    setStore('agentChatThreads', [
      buildThread('t1', 'Import companies', CHANNEL.id),
      buildThread('t2', 'Private notes', null),
      buildThread('t3', 'Elsewhere', 'other-channel'),
    ]);

    renderPage(CHANNEL.id);

    expect(screen.getByText('Sales')).toBeVisible();
    expect(screen.getByText('Import companies')).toBeVisible();
    expect(screen.queryByText('Private notes')).toBeNull();
    expect(screen.queryByText('Elsewhere')).toBeNull();
  });

  it('shows an empty state and a new chat action for an empty channel', () => {
    setStore('agentChatThreads', []);

    renderPage(CHANNEL.id);

    expect(screen.getByText('No chat in this channel yet')).toBeVisible();
    screen.getByRole('button', { name: /New chat/ }).click();
    expect(switchToNewChat).toHaveBeenCalledTimes(1);
  });

  it('tells the reader when the channel is not visible to them', () => {
    setStore('agentChatThreads', []);

    renderPage('11111111-1111-4111-8111-111111111111');

    expect(screen.getByText('Channel not found')).toBeVisible();
  });
});
