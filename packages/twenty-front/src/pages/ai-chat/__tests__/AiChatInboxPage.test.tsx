import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type AgentChatThread,
  AgentChatThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { AiChatInboxPage } from '~/pages/ai-chat/AiChatInboxPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat: jest.fn() }),
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
jest.mock('@/ai/components/AiChatInboxThreadPane', () => {
  const { useParams } = jest.requireActual('react-router-dom');

  return {
    AiChatInboxThreadPane: () => {
      const { threadId } = useParams();

      return (
        <div>
          {threadId === undefined ? 'New chat' : `Chat for ${threadId}`}
        </div>
      );
    },
  };
});

const VIEWER_ID = 'uw-viewer';

const buildThread = (
  id: string,
  title: string,
  overrides: Partial<AgentChatThread> = {},
): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title,
  channelId: null,
  ownerUserWorkspaceId: VIEWER_ID,
  status: AgentChatThreadStatus.OPEN,
  mentionedUserWorkspaceIds: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: '2026-09-01T00:00:00.000Z',
  lastMessagePreview: null,
  lastMessageRole: null,
  lastMessageAuthorUserWorkspaceId: null,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
  ...overrides,
});

const setThreads = (threads: AgentChatThread[]) => {
  jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: threads as object[],
    draft: threads as object[],
    status: 'up-to-date',
  });
};

const renderPage = (path: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={AppPath.AiChatInbox} element={<AiChatInboxPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

const ASSIGNED = buildThread('t-assigned', 'Renewal follow-up', {
  channelId: 'channel-1',
  assigneeUserWorkspaceId: VIEWER_ID,
});
const SUBSCRIBED = buildThread('t-subscribed', 'Pricing question', {
  channelId: 'channel-1',
  ownerUserWorkspaceId: 'uw-someone-else',
  mentionedUserWorkspaceIds: [VIEWER_ID],
});
const DIRECT_MESSAGE = buildThread('t-direct', 'Private notes');
const SOMEBODY_ELSES = buildThread('t-elsewhere', 'Not mine', {
  channelId: 'channel-1',
  ownerUserWorkspaceId: 'uw-someone-else',
});

describe('AiChatInboxPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    const viewer = {
      id: 'member-viewer',
      userWorkspaceId: VIEWER_ID,
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      userEmail: 'ada@apple.dev',
      locale: 'en',
      colorScheme: 'Light' as const,
    };

    jotaiStore.set(currentWorkspaceMemberState.atom, viewer);
    jotaiStore.set(currentWorkspaceMembersState.atom, [viewer]);
    setThreads([ASSIGNED, SUBSCRIBED, DIRECT_MESSAGE, SOMEBODY_ELSES]);
  });

  it('gathers the three reasons a chat is yours and leaves the rest out', async () => {
    renderPage('/chat/inbox/t-direct');

    expect(screen.getByText('Renewal follow-up')).toBeVisible();
    expect(screen.getByText('Pricing question')).toBeVisible();
    expect(screen.getByText('Private notes')).toBeVisible();
    expect(screen.queryByText('Not mine')).toBeNull();
  });

  it('narrows to what was handed to you', async () => {
    renderPage('/chat/inbox/t-direct');

    screen.getByRole('tab', { name: /Assigned/ }).click();

    expect(await screen.findByText('Renewal follow-up')).toBeVisible();
    expect(screen.queryByText('Pricing question')).toBeNull();
    expect(screen.queryByText('Private notes')).toBeNull();
  });

  it('narrows to the channel chats that tagged you', async () => {
    renderPage('/chat/inbox/t-direct');

    screen.getByRole('tab', { name: /Subscribed/ }).click();

    expect(await screen.findByText('Pricing question')).toBeVisible();
    expect(screen.queryByText('Renewal follow-up')).toBeNull();
  });

  it('narrows to the chats outside every channel', async () => {
    renderPage('/chat/inbox/t-direct');

    screen.getByRole('tab', { name: /Direct messages/ }).click();

    expect(await screen.findByText('Private notes')).toBeVisible();
    expect(screen.queryByText('Pricing question')).toBeNull();
  });

  it('opens on the first chat of the list rather than on a new one', async () => {
    renderPage('/chat/inbox');

    expect(await screen.findByText(/^Chat for /)).toBeVisible();
  });

  it('keeps the composer when there is nothing to open', async () => {
    setThreads([SOMEBODY_ELSES]);

    renderPage('/chat/inbox');

    expect(await screen.findByText('New chat')).toBeVisible();
    expect(screen.getByText('Your inbox is clear')).toBeVisible();
  });
});
