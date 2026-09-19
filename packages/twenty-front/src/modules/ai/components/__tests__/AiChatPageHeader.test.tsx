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
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type AgentChatThread,
  AgentChatThreadStatus,
} from '~/generated-metadata/graphql';

const switchToNewChat = jest.fn();
const renameChatThread = jest.fn();
const markChatThreadDone = jest.fn();
const reopenChatThread = jest.fn();
const snoozeChatThread = jest.fn();
const assignChatThread = jest.fn();
const deleteChatThread = jest.fn();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat }),
}));
jest.mock('@/ai/hooks/useRenameChatThread', () => ({
  useRenameChatThread: () => ({ renameChatThread }),
}));
jest.mock('@/ai/hooks/useChatThreadInboxActions', () => ({
  useChatThreadInboxActions: () => ({
    markChatThreadDone,
    reopenChatThread,
    snoozeChatThread,
    assignChatThread,
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
  ownerUserWorkspaceId: 'owner-user-workspace-id',
  status: AgentChatThreadStatus.OPEN,
  mentionedUserWorkspaceIds: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: '2026-09-01T00:00:00.000Z',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
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

  it('marks the current conversation done from the header', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.getByText('Best leads')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Mark chat done' }));
    expect(markChatThreadDone).toHaveBeenCalledWith(THREAD.id);
    expect(
      screen.queryByRole('button', { name: 'Collapse to side panel' }),
    ).toBeNull();
  });

  it('reopens a conversation that was marked done', async () => {
    const user = userEvent.setup();

    setThreads([{ ...THREAD, status: AgentChatThreadStatus.DONE }]);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Reopen chat' }));
    expect(reopenChatThread).toHaveBeenCalledWith(THREAD.id);
  });

  it('offers no snooze once a conversation is done', () => {
    setThreads([{ ...THREAD, status: AgentChatThreadStatus.DONE }]);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: 'Snooze chat' })).toBeNull();
  });

  it('snoozes the current conversation until a chosen time', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Snooze chat' }));
    await user.click(screen.getByText('Tomorrow morning'));

    expect(snoozeChatThread).toHaveBeenCalledWith(THREAD.id, expect.any(Date));
  });

  it('leaves starting a new chat to the navigation drawer', () => {
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: /^New chat/ })).toBeNull();
  });

  it('links a workflow run conversation back to its run', async () => {
    const user = userEvent.setup();
    const runThread = {
      ...THREAD,
      workflowRunId: '4d2a7b9c-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
      workflowStepId: 'step-id',
    };

    setThreads([runThread]);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    const chip = screen.getByRole('button', { name: 'Workflow run' });

    expect(chip).toBeVisible();
    await user.click(chip);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/object/workflowRun/${runThread.workflowRunId}`,
      undefined,
    );
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

  it('offers the standard conversation actions', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.getByText('Best leads')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Chat actions' }));
    expect(screen.getByText('Rename')).toBeVisible();
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

  it('leaves archiving out of the menu now that done replaces it', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Chat actions' }));

    expect(screen.queryByText('Archive')).toBeNull();
    expect(screen.queryByText('Unarchive')).toBeNull();
    expect(screen.getByText('Delete')).toBeVisible();
  });

  it('opens the rename editor when clicking the title', async () => {
    const user = userEvent.setup();
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Rename chat' }));
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Best leads');
    expect(input).toHaveFocus();

    await user.clear(input);
    await user.type(input, 'Qualified leads{Enter}');
    expect(renameChatThread).toHaveBeenCalledTimes(1);
    expect(renameChatThread).toHaveBeenCalledWith(THREAD.id, 'Qualified leads');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it.each(['{Enter}', ' '])(
    'opens the rename editor from the keyboard with %s',
    async (key) => {
      const user = userEvent.setup();
      render(<AiChatPageHeader />, { wrapper: Wrapper });

      await user.tab();
      expect(screen.getByRole('button', { name: 'Rename chat' })).toHaveFocus();
      await user.keyboard(key);

      expect(screen.getByRole('textbox')).toHaveValue('Best leads');
      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(renameChatThread).not.toHaveBeenCalled();
    },
  );

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
    await user.click(screen.getByRole('button', { name: 'Mark chat done' }));

    expect(renameChatThread).toHaveBeenCalledTimes(1);
    expect(renameChatThread).toHaveBeenCalledWith(THREAD.id, 'Qualified leads');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(markChatThreadDone).toHaveBeenCalledWith(THREAD.id);
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
