import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { InboxThreadListItem } from '@/inbox/components/InboxThreadListItem';
import { setInboxSelectedChannelView } from '@/inbox/testing/setInboxSelectedChannelView';
import { aiChatChannelsState } from '@/ai-chat/threads/states/aiChatChannelsState';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/inbox/components/InboxThreadActionsDropdown', () => ({
  InboxThreadActionsDropdown: () => null,
}));

jest.mock('@/ai-chat/threads/hooks/useAiChatThreadRename', () => ({
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
  thread: Partial<AiChatThreadRecord>,
): AiChatThreadRecord => ({
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
  applicationId: 'workspace-custom-application-id',
  isAccessible: true,
  roleIds: [],
};

const renderListItem = ({
  thread,
  isChecked = false,
  onClick = jest.fn(),
  onCheckboxClick,
}: Pick<
  ComponentProps<typeof InboxThreadListItem>,
  'thread' | 'isChecked' | 'onCheckboxClick'
> &
  Partial<Pick<ComponentProps<typeof InboxThreadListItem>, 'onClick'>>) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={['/inbox']}>
        <I18nProvider i18n={i18n}>
          <InboxThreadListItem
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

describe('InboxThreadListItem', () => {
  beforeAll(() => {
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  beforeEach(() => {
    resetJotaiStore();
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
    jotaiStore.set(aiChatChannelsState.atom, [SALES_CHANNEL]);

    renderListItem({ thread: buildThread({ channelId: SALES_CHANNEL.id }) });

    expect(screen.getByTitle('Sales')).toBeInTheDocument();
    expect(screen.getByText('In Sales')).toBeInTheDocument();
  });

  it('shows no channel for a chat outside channels', () => {
    jotaiStore.set(aiChatChannelsState.atom, [SALES_CHANNEL]);

    renderListItem({ thread: buildThread({ channelId: null }) });

    expect(screen.queryByTitle('Sales')).not.toBeInTheDocument();
  });

  it('shows no channel while viewing that channel', () => {
    jotaiStore.set(aiChatChannelsState.atom, [SALES_CHANNEL]);
    setInboxSelectedChannelView(jotaiStore, {
      channelId: SALES_CHANNEL.id,
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
      filter: AgentChatChannelThreadFilter.ANY,
    });

    renderListItem({ thread: buildThread({ channelId: SALES_CHANNEL.id }) });

    expect(screen.queryByTitle('Sales')).not.toBeInTheDocument();
  });
});
