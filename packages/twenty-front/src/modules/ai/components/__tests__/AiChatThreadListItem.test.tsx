import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/AiChatThreadActionsDropdown', () => ({
  AiChatThreadActionsDropdown: () => null,
}));

jest.mock('@/ai/hooks/useAiChatThreadRename', () => ({
  useAiChatThreadRename: () => ({
    isRenaming: false,
    draftTitle: '',
    setDraftTitle: jest.fn(),
    startRename: jest.fn(),
    cancelRename: jest.fn(),
    commitRename: jest.fn(),
  }),
}));

const buildThread = (
  thread: Partial<AgentChatThreadRecord>,
): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id: '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60',
  title: 'Q3 renewal outreach',
  deletedAt: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
  lastMessageText: 'Which plan should I quote?',
  ...thread,
});

const SALES_CHANNEL = {
  id: '3d8a1f5c-6b2e-4c9d-8e7f-0a1b2c3d4e5f',
  name: 'Sales',
  icon: 'IconCoins',
  color: 'green',
  position: 1,
  isCustom: true,
  isAccessible: true,
  roleIds: [],
};

const renderListItem = ({
  thread,
  isChecked = false,
  onClick = jest.fn(),
  onCheckboxClick,
}: Pick<
  ComponentProps<typeof AiChatThreadListItem>,
  'thread' | 'isChecked' | 'onCheckboxClick'
> &
  Partial<Pick<ComponentProps<typeof AiChatThreadListItem>, 'onClick'>>) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={['/inbox']}>
        <I18nProvider i18n={i18n}>
          <AiChatThreadListItem
            thread={thread}
            isSelected={false}
            isChecked={isChecked}
            onClick={onClick}
            onCheckboxClick={onCheckboxClick}
          />
        </I18nProvider>
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('AiChatThreadListItem', () => {
  beforeAll(() => {
    // jsdom has no PointerEvent, which the checkbox dispatches on click
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  beforeEach(() => {
    resetJotaiStore();
  });

  it('shows the last message under the title', () => {
    renderListItem({ thread: buildThread({}) });

    expect(screen.getByText('Which plan should I quote?')).toBeInTheDocument();
    expect(screen.queryByText('Needs input')).not.toBeInTheDocument();
  });

  it('shows that the chat needs input while a question waits on an answer', () => {
    renderListItem({
      thread: buildThread({
        pendingQuestionMessageId: '0b6e3f1a-2c4d-4b8e-9a7f-1d3c5e7a9b20',
      }),
    });

    expect(screen.getByText('Needs input')).toBeInTheDocument();
    expect(screen.getByText('Which plan should I quote?')).toBeInTheDocument();
  });

  it('does not ask for input on a deleted chat', () => {
    renderListItem({
      thread: buildThread({
        deletedAt: '2026-09-08T00:00:00.000Z',
        pendingQuestionMessageId: '0b6e3f1a-2c4d-4b8e-9a7f-1d3c5e7a9b20',
      }),
    });

    expect(screen.queryByText('Needs input')).not.toBeInTheDocument();
  });

  it('shows an unsent draft in place of the last message', () => {
    const thread = buildThread({});

    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
      [thread.id]: serializePlainTextAsAdvancedTextEditorDocument(
        'Quote the **annual** plan',
      ),
    });

    renderListItem({ thread });

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Quote the **annual** plan')).toBeInTheDocument();
    expect(
      screen.queryByText('Which plan should I quote?'),
    ).not.toBeInTheDocument();
  });

  it('shows no draft once the composer is cleared', () => {
    const thread = buildThread({});

    jotaiStore.set(agentChatDraftsByThreadIdState.atom, { [thread.id]: '' });

    renderListItem({ thread });

    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.getByText('Which plan should I quote?')).toBeInTheDocument();
  });

  it('has no checkbox where chats cannot be selected', () => {
    renderListItem({ thread: buildThread({}) });

    expect(
      screen.queryByRole('checkbox', { name: 'Select chat' }),
    ).not.toBeInTheDocument();
  });

  it('checks the chat from its checkbox without opening it', async () => {
    const onClick = jest.fn();
    const onCheckboxClick = jest.fn();
    const thread = buildThread({});

    renderListItem({ thread, onClick, onCheckboxClick });

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select chat' }),
    );

    expect(onCheckboxClick).toHaveBeenCalledTimes(1);
    expect(onCheckboxClick).toHaveBeenCalledWith(thread, expect.anything());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a checked chat as checked', () => {
    renderListItem({
      thread: buildThread({}),
      isChecked: true,
      onCheckboxClick: jest.fn(),
    });

    expect(screen.getByRole('checkbox', { name: 'Select chat' })).toBeChecked();
  });

  it('shows the channel a chat belongs to next to its time', () => {
    jotaiStore.set(agentChatChannelsState.atom, [SALES_CHANNEL]);

    renderListItem({ thread: buildThread({ channelId: SALES_CHANNEL.id }) });

    expect(screen.getByTitle('Sales')).toBeInTheDocument();
    expect(screen.getByText('In Sales')).toBeInTheDocument();
  });

  it('shows no channel for a chat outside channels', () => {
    jotaiStore.set(agentChatChannelsState.atom, [SALES_CHANNEL]);

    renderListItem({ thread: buildThread({ channelId: null }) });

    expect(screen.queryByTitle('Sales')).not.toBeInTheDocument();
  });

  it('shows no channel while viewing that channel', () => {
    jotaiStore.set(agentChatChannelsState.atom, [SALES_CHANNEL]);
    jotaiStore.set(agentChatChannelViewState.atom, {
      channelId: SALES_CHANNEL.id,
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
    });

    renderListItem({ thread: buildThread({ channelId: SALES_CHANNEL.id }) });

    expect(screen.queryByTitle('Sales')).not.toBeInTheDocument();
  });
});
