import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';
import { AI_CHAT_THREADS_LIST_FOCUS_ID } from '@/ai/constants/AiChatThreadsListFocusId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const mockSwitchToNewChat = jest.fn();

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({
    switchToNewChat: mockSwitchToNewChat,
  }),
}));

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({
    threads: [],
    hasNextPage: false,
    loading: false,
    fetchMoreRef: jest.fn(),
  }),
}));

jest.mock('@/ai/components/AiChatThreadFilterDropdown', () => ({
  AiChatThreadFilterDropdown: () => null,
}));

jest.mock('@/ai/components/AiChatThreadDeleteConfirmationModal', () => ({
  AiChatThreadDeleteConfirmationModal: () => null,
}));

describe('AiChatThreadsList', () => {
  beforeEach(() => {
    mockSwitchToNewChat.mockClear();
  });

  it('keeps a distinct side panel focus for the new chat hotkey', async () => {
    const store = createStore();

    store.set(focusStackState.atom, [
      {
        focusId: SIDE_PANEL_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.SIDE_PANEL,
          componentInstanceId: SIDE_PANEL_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      },
    ]);

    render(
      <JotaiProvider store={store}>
        <MemoryRouter>
          <AiChatThreadsList />
        </MemoryRouter>
      </JotaiProvider>,
    );

    expect(screen.getByText('New chat')).toBeInTheDocument();

    await waitFor(() => {
      expect(store.get(focusStackState.atom).at(-1)?.focusId).toBe(
        AI_CHAT_THREADS_LIST_FOCUS_ID,
      );
    });

    act(() => {
      store.set(
        focusStackState.atom,
        store
          .get(focusStackState.atom)
          .filter((item) => item.focusId !== SIDE_PANEL_FOCUS_ID),
      );
    });

    expect(store.get(focusStackState.atom).at(-1)?.focusId).toBe(
      AI_CHAT_THREADS_LIST_FOCUS_ID,
    );

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Enter',
        code: 'Enter',
        metaKey: true,
      });
    });

    expect(mockSwitchToNewChat).toHaveBeenCalledTimes(1);
  });
});
