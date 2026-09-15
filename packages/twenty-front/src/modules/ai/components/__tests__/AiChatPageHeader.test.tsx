import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const switchToNewChat = jest.fn();
const renameChatThread = jest.fn();
const archiveChatThread = jest.fn();
const unarchiveChatThread = jest.fn();
const deleteChatThread = jest.fn();

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat }),
}));
jest.mock('@/ai/hooks/useRenameChatThread', () => ({
  useRenameChatThread: () => ({ renameChatThread }),
}));
jest.mock('@/ai/hooks/useChatThreadArchiveActions', () => ({
  useChatThreadArchiveActions: () => ({
    archiveChatThread,
    unarchiveChatThread,
  }),
}));
jest.mock('@/ai/hooks/useDeleteChatThread', () => ({
  useDeleteChatThread: () => ({ deleteChatThread }),
}));
jest.mock('@/navigation/hooks/useNavigationDrawerExpanded', () => ({
  useNavigationDrawerExpanded: () => true,
}));
jest.mock('@/ai/components/AiChatCloseButton', () => ({
  AiChatCloseButton: () => <button>Close chat</button>,
}));

const THREAD: AgentChatThread = {
  __typename: 'AgentChatThread',
  id: 'thread-1',
  title: 'Best leads',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: '2026-09-01T00:00:00.000Z',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'ai-chat-header-test' }}
        >
          {children}
        </AgentChatComponentInstanceContext.Provider>
      </MemoryRouter>
    </I18nProvider>
  </JotaiProvider>
);

const setThreads = (threads: AgentChatThread[]) => {
  jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: threads,
    draft: threads,
    status: 'up-to-date',
  });
};

describe('AiChatPageHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    setThreads([THREAD]);
    jotaiStore.set(currentAiChatThreadState.atom, THREAD.id);
    renameChatThread.mockResolvedValue(true);
  });

  it.each([null, AGENT_CHAT_NEW_THREAD_DRAFT_KEY])(
    'hides conversation actions on the new-chat page (%s)',
    (threadId) => {
      jotaiStore.set(currentAiChatThreadState.atom, threadId);
      render(<AiChatPageHeader />, { wrapper: Wrapper });

      expect(screen.getByText('New chat')).toBeVisible();
      expect(screen.queryByRole('button', { name: /^New chat/ })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Chat actions' })).toBeNull();
    },
  );

  it('starts a new chat from the current conversation', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.getByText('Best leads')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^New chat/ }));
    expect(switchToNewChat).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Collapse to side panel' }),
    ).toBeNull();
  });

  it('does not label an existing chat as new while its metadata loads', () => {
    setThreads([]);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.queryByText('New chat')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Chat actions' })).toBeNull();

    act(() => setThreads([THREAD]));

    expect(screen.getByText('Best leads')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Chat actions' })).toBeVisible();
  });

  it.each([0, 100])(
    'keeps New chat hidden without messages regardless of token usage (%s)',
    (conversationSize) => {
      setThreads([{ ...THREAD, lastMessageAt: null, conversationSize }]);
      render(<AiChatPageHeader />, { wrapper: Wrapper });

      expect(screen.queryByRole('button', { name: /^New chat/ })).toBeNull();
    },
  );

  it('shows New chat as soon as messages load without a last-message timestamp', () => {
    setThreads([{ ...THREAD, lastMessageAt: null }]);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD.id);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: /^New chat/ })).toBeNull();

    act(() => {
      jotaiStore.set(
        agentChatMessagesComponentFamilyState.atomFamily({
          instanceId: 'ai-chat-header-test',
          familyKey: { threadId: THREAD.id },
        }),
        [{ id: 'message-1', role: 'user', parts: [] }],
      );
    });

    expect(screen.getByRole('button', { name: /^New chat/ })).toBeVisible();
  });

  it('checks the header thread for messages while a different conversation is displayed', () => {
    setThreads([{ ...THREAD, lastMessageAt: null }]);
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'previous-thread');
    jotaiStore.set(
      agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: 'ai-chat-header-test',
        familyKey: { threadId: 'previous-thread' },
      }),
      [{ id: 'previous-message', role: 'user', parts: [] }],
    );
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: /^New chat/ })).toBeNull();

    act(() => {
      jotaiStore.set(
        agentChatMessagesComponentFamilyState.atomFamily({
          instanceId: 'ai-chat-header-test',
          familyKey: { threadId: THREAD.id },
        }),
        [{ id: 'current-message', role: 'user', parts: [] }],
      );
    });

    expect(screen.getByRole('button', { name: /^New chat/ })).toBeVisible();
  });

  it('offers the standard conversation actions', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.getByText('Best leads')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^New chat/ }));
    expect(switchToNewChat).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    expect(screen.getByText('Rename')).toBeVisible();
    expect(screen.getByText('Archive')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });

  it('uses the generated title before metadata refreshes and prefers later renames', async () => {
    setThreads([{ ...THREAD, title: null }]);
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    act(() => {
      jotaiStore.set(
        currentAiChatThreadTitleComponentFamilyState.atomFamily({
          instanceId: 'ai-chat-header-test',
          familyKey: { threadId: THREAD.id },
        }),
        'Generated title',
      );
    });

    expect(screen.getByText('Generated title')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    expect(screen.getByRole('textbox')).toHaveValue('Generated title');
    await user.keyboard('{Enter}');
    expect(renameChatThread).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Delete'));
    expect(
      within(screen.getByRole('dialog')).getByText('Generated title'),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^Cancel/ }));

    act(() => setThreads([{ ...THREAD, title: 'Renamed title' }]));
    expect(screen.getByText('Renamed title')).toBeVisible();
    expect(screen.queryByText('Generated title')).toBeNull();
  });

  it('offers archive and unarchive even when the current chat is filtered out of the sidebar', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Archive'));
    expect(archiveChatThread).toHaveBeenCalledWith(THREAD.id);

    act(() => setThreads([{ ...THREAD, deletedAt: '2026-09-07T00:00:00Z' }]));

    expect(screen.getByText('Best leads')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Unarchive'));
    expect(unarchiveChatThread).toHaveBeenCalledWith(THREAD.id);
  });

  it('renames the current chat and discards the rename editor when switching threads', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Qualified leads{Enter}');
    expect(renameChatThread).toHaveBeenCalledWith(THREAD.id, 'Qualified leads');

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    act(() => {
      setThreads([THREAD, { ...THREAD, id: 'thread-2', title: 'Other chat' }]);
      jotaiStore.set(currentAiChatThreadState.atom, 'thread-2');
    });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Other chat')).toBeVisible();
  });

  it.each(['{Enter}', '{Tab}', '{Shift>}{Tab}{/Shift}'])(
    'saves once and leaves the rename editor on %s',
    async (key) => {
      const user = userEvent.setup();
      render(<AiChatPageHeader />, { wrapper: Wrapper });

      await user.click(screen.getByRole('button', { name: 'Chat actions' }));
      await user.click(screen.getByText('Rename'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Qualified leads');
      await user.keyboard(key);

      expect(renameChatThread).toHaveBeenCalledTimes(1);
      expect(renameChatThread).toHaveBeenCalledWith(
        THREAD.id,
        'Qualified leads',
      );
      expect(screen.queryByRole('textbox')).toBeNull();
    },
  );

  it('saves when clicking outside without swallowing the next action', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Qualified leads');
    await user.click(screen.getByRole('button', { name: /^New chat/ }));

    expect(renameChatThread).toHaveBeenCalledTimes(1);
    expect(renameChatThread).toHaveBeenCalledWith(THREAD.id, 'Qualified leads');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(switchToNewChat).toHaveBeenCalledTimes(1);
  });

  it('discards the draft on Escape without saving', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Discard this{Escape}');

    expect(renameChatThread).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Best leads')).toBeVisible();
  });

  it('preserves the draft for retry when saving fails', async () => {
    renameChatThread.mockResolvedValueOnce(false);
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Rename'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Qualified leads{Enter}');

    expect(screen.getByRole('textbox')).toHaveValue('Qualified leads');
    expect(screen.getByRole('textbox')).not.toHaveFocus();
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');

    expect(renameChatThread).toHaveBeenCalledTimes(2);
    expect(renameChatThread).toHaveBeenLastCalledWith(
      THREAD.id,
      'Qualified leads',
    );
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('requires confirmation before deleting the current chat', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    await user.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete chat')).toBeVisible();
    expect(deleteChatThread).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /^Delete/ }));
    expect(deleteChatThread).toHaveBeenCalledWith(THREAD.id);
  });
});
