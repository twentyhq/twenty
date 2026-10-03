import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { atom, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import {
  resetJotaiStore,
  jotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { AiChatInboxPage } from '~/pages/ai-chat/AiChatInboxPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const buildThread = (id: string, title: string): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
});

const THREADS = [
  buildThread('6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60', 'First chat'),
  buildThread('0b6e3f1a-2c4d-4b8e-9a7f-1d3c5e7a9b20', 'Second chat'),
  buildThread('9d2a4c6e-8b1f-4e3a-8c5d-7f9b1a3c5e40', 'Third chat'),
];

const chatObjectMetadataItemAtom = atom<unknown>({
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
});

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
    selectorFamily: () => chatObjectMetadataItemAtom,
  },
}));

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({ threads: THREADS, loading: false }),
}));

jest.mock('@/ai/components/AiChatThreadList', () => ({
  AiChatThreadList: ({
    threads,
    selectedThreadIds,
    onThreadClick,
  }: {
    threads: AgentChatThreadRecord[];
    selectedThreadIds: string[];
    onThreadClick: (
      thread: AgentChatThreadRecord,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
  }) =>
    threads.map((thread) => (
      <button
        key={thread.id}
        aria-pressed={selectedThreadIds.includes(thread.id)}
        onClick={(event) => onThreadClick(thread, event)}
      >
        {thread.title}
      </button>
    )),
}));

jest.mock('@/ai/components/AiChatThreadFilterDropdown', () => ({
  AiChatThreadFilterDropdown: () => null,
}));

jest.mock('@/ai/components/AgentChatThreadsFetchMoreTrigger', () => ({
  AgentChatThreadsFetchMoreTrigger: () => null,
}));

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat: jest.fn() }),
}));

jest.mock('~/pages/ai-chat/AiChatPageEffects', () => ({
  AiChatPageEffects: () => null,
}));

jest.mock('~/pages/ai-chat/AiChatThreadPageContent', () => ({
  AiChatThreadPageContent: ({ threadId }: { threadId: string }) => (
    <div>Chat page {threadId}</div>
  ),
}));

jest.mock('@/information-banner/components/InformationBannerWrapper', () => ({
  InformationBannerWrapper: () => null,
}));

// Command menu items throw without the context store and command menu
// instances, so the stand-in requires them too
jest.mock('@/command-menu-item/contexts/CommandMenuContextProvider', () => ({
  CommandMenuContextProvider: ({ children }: { children: ReactNode }) => {
    useAvailableComponentInstanceIdOrThrow(
      ContextStoreComponentInstanceContext,
    );
    useAvailableComponentInstanceIdOrThrow(CommandMenuComponentInstanceContext);
    return children;
  },
}));

jest.mock(
  '@/command-menu-item/display/components/PinnedCommandMenuItemButtons',
  () => ({ PinnedCommandMenuItemButtons: () => null }),
);

const [firstThread, secondThread, thirdThread] = THREADS;

const renderInbox = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/inbox/${firstThread.id}`]}>
          <Routes>
            <Route path={AppPath.AiChatInbox} element={<AiChatInboxPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

const isRowHighlighted = (title: string) =>
  screen.getByRole('button', { name: title }).getAttribute('aria-pressed') ===
  'true';

describe('AiChatInboxPage', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('opens the clicked chat', () => {
    renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }));

    expect(
      screen.getByText(`Chat page ${secondThread.id}`),
    ).toBeInTheDocument();
  });

  it('adds a chat to the one on screen with cmd+click', () => {
    renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Third chat' }), {
      metaKey: true,
    });

    expect(screen.getByText('2 chats selected')).toBeInTheDocument();
    expect(
      jotaiStore.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: AI_CHAT_INBOX_INSTANCE_ID,
        }),
      ),
    ).toEqual({
      mode: 'selection',
      selectedRecordIds: [firstThread.id, thirdThread.id],
    });
    expect(isRowHighlighted('First chat')).toBe(true);
    expect(isRowHighlighted('Second chat')).toBe(false);
    expect(isRowHighlighted('Third chat')).toBe(true);
  });

  it('selects every chat from the one on screen with shift+click', () => {
    renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Third chat' }), {
      shiftKey: true,
    });

    expect(screen.getByText('3 chats selected')).toBeInTheDocument();
  });

  it('goes back to the chat on screen once the selection is cleared', () => {
    renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }), {
      ctrlKey: true,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(screen.getByText(`Chat page ${firstThread.id}`)).toBeInTheDocument();
  });

  it('clears the selection when leaving the inbox', () => {
    const { unmount } = renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }), {
      metaKey: true,
    });
    unmount();

    expect(
      jotaiStore.get(
        selectedRecordIdsComponentSelector.selectorFamily({
          instanceId: AI_CHAT_INBOX_INSTANCE_ID,
        }),
      ),
    ).toEqual([]);
    expect(
      jotaiStore.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: AI_CHAT_INBOX_INSTANCE_ID,
        }),
      ),
    ).toEqual({ mode: 'selection', selectedRecordIds: [] });
  });
});
