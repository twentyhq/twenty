import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { atom, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
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

const chatObjectMetadataItemAtom = atom<Pick<EnrichedObjectMetadataItem, 'id'>>(
  { id: 'chat-object' },
);

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
    checkedThreadIds,
    onThreadClick,
    onThreadCheckboxClick,
    onThreadContextMenu,
  }: {
    threads: AgentChatThreadRecord[];
    selectedThreadIds: string[];
    checkedThreadIds: string[];
    onThreadClick: (
      thread: AgentChatThreadRecord,
      event: React.MouseEvent<HTMLElement>,
    ) => void;
    onThreadCheckboxClick?: (
      thread: AgentChatThreadRecord,
      event: React.MouseEvent<HTMLElement>,
    ) => void;
    onThreadContextMenu?: (
      thread: AgentChatThreadRecord,
      event: React.MouseEvent<HTMLElement>,
    ) => void;
  }) =>
    threads.map((thread) => (
      <div key={thread.id}>
        <input
          type="checkbox"
          aria-label={`Select ${thread.title}`}
          checked={checkedThreadIds.includes(thread.id)}
          disabled={!onThreadCheckboxClick}
          readOnly
          onClick={(event) => onThreadCheckboxClick?.(thread, event)}
        />
        <button
          aria-pressed={selectedThreadIds.includes(thread.id)}
          onClick={(event) => onThreadClick(thread, event)}
          onContextMenu={(event) => onThreadContextMenu?.(thread, event)}
        >
          {thread.title}
        </button>
      </div>
    )),
}));

jest.mock('@/ai/components/AgentChatThreadsFetchMoreTrigger', () => ({
  AgentChatThreadsFetchMoreTrigger: () => null,
}));

jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ fetchMoreAgentChatThreads: jest.fn() }),
}));

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat: jest.fn() }),
}));

jest.mock('~/pages/ai-chat/AiChatPageEffects', () => ({
  AiChatPageEffects: () => null,
}));

jest.mock('~/pages/ai-chat/AiChatThreadPageContent', () => ({
  AiChatThreadPageContent: ({
    threadId,
    headerTitlePrefix,
    headerActions,
  }: {
    threadId: string;
    headerTitlePrefix?: ReactNode;
    headerActions?: ReactNode;
  }) => (
    <div>
      {headerTitlePrefix}
      Chat page {threadId}
      {headerActions}
    </div>
  ),
}));

let isMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => isMobile,
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

let mockIsAiChatInboxEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsAiChatInboxEnabled,
}));

const [firstThread, secondThread, thirdThread] = THREADS;

const renderInbox = (path = `/inbox/${firstThread.id}`) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <MemoryRouterAppNavigatorProvider>
            <Routes>
              <Route path={AppPath.AiChatInbox} element={<AiChatInboxPage />} />
              <Route
                path={AppPath.AiChat}
                element={<div>Chat page without the inbox</div>}
              />
            </Routes>
          </MemoryRouterAppNavigatorProvider>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

const isRowOpen = (title: string) =>
  screen.getByRole('button', { name: title }).getAttribute('aria-pressed') ===
  'true';

const getRowCheckbox = (title: string) =>
  screen.getByRole('checkbox', { name: `Select ${title}` });

const getTargetedThreadIds = (contextStoreInstanceId: string) =>
  jotaiStore.get(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: contextStoreInstanceId,
    }),
  );

describe('AiChatInboxPage', () => {
  beforeEach(() => {
    resetJotaiStore();
    isMobile = false;
    mockIsAiChatInboxEnabled = true;
  });

  it('sends the inbox to the chat page while the inbox feature flag is off', () => {
    mockIsAiChatInboxEnabled = false;

    renderInbox();

    expect(screen.getByText('Chat page without the inbox')).toBeInTheDocument();
  });

  it('opens the first chat beside the list', () => {
    renderInbox('/inbox');

    expect(screen.getByText(`Chat page ${firstThread.id}`)).toBeInTheDocument();
    expect(
      screen.queryByText('No conversation selected'),
    ).not.toBeInTheDocument();
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
    expect(getTargetedThreadIds(AI_CHAT_INBOX_INSTANCE_ID)).toEqual({
      mode: 'selection',
      selectedRecordIds: [firstThread.id, thirdThread.id],
    });
    expect(getRowCheckbox('First chat')).toBeChecked();
    expect(getRowCheckbox('Second chat')).not.toBeChecked();
    expect(getRowCheckbox('Third chat')).toBeChecked();
    expect(isRowOpen('First chat')).toBe(false);
  });

  it('checks a chat from its checkbox, leaving the chat on screen out', () => {
    renderInbox();

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Third chat' }),
    );

    expect(screen.getByText('1 chat selected')).toBeInTheDocument();
    expect(getRowCheckbox('First chat')).not.toBeChecked();
    expect(getRowCheckbox('Third chat')).toBeChecked();
  });

  it('checks the chat on screen from its checkbox', () => {
    renderInbox();

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select First chat' }),
    );

    expect(screen.getByText('1 chat selected')).toBeInTheDocument();
    expect(getRowCheckbox('First chat')).toBeChecked();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('counts the selection in the list header instead of offering a new chat', () => {
    renderInbox();

    expect(
      screen.getByRole('button', { name: 'New chat' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Third chat' }), {
      metaKey: true,
    });

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'New chat' }),
    ).not.toBeInTheDocument();
  });

  it('lets the command menu act on the selection while it is shown', () => {
    renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Third chat' }), {
      metaKey: true,
    });

    expect(getTargetedThreadIds(MAIN_CONTEXT_STORE_INSTANCE_ID)).toEqual({
      mode: 'selection',
      selectedRecordIds: [firstThread.id, thirdThread.id],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(getTargetedThreadIds(MAIN_CONTEXT_STORE_INSTANCE_ID)).toEqual({
      mode: 'selection',
      selectedRecordIds: [],
    });
  });

  it('opens the command menu on the right-clicked chats', () => {
    renderInbox();

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Second chat' }));
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Third chat' }));

    expect(screen.getByText('2 chats selected')).toBeInTheDocument();
    expect(getTargetedThreadIds(AI_CHAT_INBOX_INSTANCE_ID)).toEqual({
      mode: 'selection',
      selectedRecordIds: [secondThread.id, thirdThread.id],
    });
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: getCommandMenuDropdownIdFromCommandMenuId(
            AI_CHAT_INBOX_INSTANCE_ID,
          ),
        }),
      ),
    ).toBe(true);
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
    expect(isRowOpen('First chat')).toBe(true);
  });

  it('starts with no selection when coming back to the inbox', () => {
    const { unmount } = renderInbox();

    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }), {
      metaKey: true,
    });
    unmount();

    expect(getTargetedThreadIds(AI_CHAT_INBOX_INSTANCE_ID)).toEqual({
      mode: 'selection',
      selectedRecordIds: [],
    });

    renderInbox();

    expect(screen.getByText(`Chat page ${firstThread.id}`)).toBeInTheDocument();
    expect(getRowCheckbox('Second chat')).not.toBeChecked();
  });

  it('switches to the record page layout from the list header', async () => {
    renderInbox();

    await userEvent.click(
      screen.getByRole('button', { name: 'Open chats in' }),
    );
    await userEvent.click(await screen.findByText('Record page'));

    expect(jotaiStore.get(aiChatInboxLayoutState.atom)).toBe(
      AI_CHAT_INBOX_LAYOUT.RECORD_PAGE,
    );
    expect(screen.queryByText(/Chat page/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'First chat' }),
    ).toBeInTheDocument();
  });

  describe('in record page layout', () => {
    beforeEach(() => {
      jotaiStore.set(
        aiChatInboxLayoutState.atom,
        AI_CHAT_INBOX_LAYOUT.RECORD_PAGE,
      );
    });

    it('shows the list alone, then the clicked chat alone', () => {
      renderInbox('/inbox');

      expect(screen.queryByText(/Chat page/)).not.toBeInTheDocument();
      expect(
        screen.queryByText('No conversation selected'),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Second chat' }));

      expect(
        screen.getByText(`Chat page ${secondThread.id}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'First chat' }),
      ).not.toBeInTheDocument();
    });

    it('moves between chats and back to the list from the chat', () => {
      renderInbox(`/inbox/${secondThread.id}`);

      fireEvent.click(screen.getByRole('button', { name: 'Next chat' }));

      expect(
        screen.getByText(`Chat page ${thirdThread.id}`),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next chat' })).toBeDisabled();

      fireEvent.click(screen.getByRole('link', { name: /Open/ }));

      expect(screen.queryByText(/Chat page/)).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Third chat' }),
      ).toBeInTheDocument();
    });

    it('selects chats in the list, with the command menu acting on them', () => {
      renderInbox('/inbox');

      fireEvent.click(screen.getByRole('button', { name: 'Second chat' }), {
        metaKey: true,
      });

      expect(screen.getByText('1 selected')).toBeInTheDocument();
      expect(screen.queryByText('1 chat selected')).not.toBeInTheDocument();
      expect(getTargetedThreadIds(MAIN_CONTEXT_STORE_INSTANCE_ID)).toEqual({
        mode: 'selection',
        selectedRecordIds: [secondThread.id],
      });
    });
  });

  describe('on a phone', () => {
    beforeEach(() => {
      isMobile = true;
    });

    it('opens the tapped chat in place of the list', () => {
      renderInbox('/inbox');

      fireEvent.click(screen.getByRole('button', { name: 'First chat' }));

      expect(
        screen.getByText(`Chat page ${firstThread.id}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Second chat' }),
      ).not.toBeInTheDocument();
    });

    it('adds tapped chats to a selection started from a checkbox', () => {
      renderInbox('/inbox');

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Select First chat' }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Third chat' }));

      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(getRowCheckbox('First chat')).toBeChecked();
      expect(getRowCheckbox('Third chat')).toBeChecked();
      expect(screen.queryByText(/Chat page/)).not.toBeInTheDocument();
    });
  });
});
