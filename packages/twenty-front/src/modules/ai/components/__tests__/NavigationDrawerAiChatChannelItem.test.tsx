import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const CHANNEL_ID = 'channel-sales';

let threads: { id: string; channelId: string | null }[] = [];

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({
    threads,
    hasNextPage: false,
    loading: false,
    fetchMoreRef: undefined,
  }),
}));
jest.mock('@/ai/hooks/useAiChatChannelIdFromPath', () => ({
  useAiChatChannelIdFromPath: () => null,
}));
jest.mock('@/ai/hooks/useNavigateToAiChatChannelPage', () => ({
  useNavigateToAiChatChannelPage: () => ({
    navigateToAiChatChannelPage: jest.fn(),
  }),
}));
jest.mock('@/ai/components/AiChatChannelMenu', () => ({
  AiChatChannelMenu: () => null,
  getAiChatChannelMenuDropdownId: () => 'dropdown-id',
}));

const channel = {
  id: CHANNEL_ID,
  name: 'Sales',
  visibility: 'PUBLIC',
} as FlatAgentChatChannel;

const renderChannelItem = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <NavigationDrawerAiChatChannelItem channel={channel} />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatChannelItem', () => {
  beforeEach(() => {
    resetJotaiStore();
    threads = [
      { id: 'thread-1', channelId: CHANNEL_ID },
      { id: 'thread-2', channelId: CHANNEL_ID },
      { id: 'thread-3', channelId: 'channel-other' },
    ];
  });

  it('badges the channel with the threads waiting to be read in it', () => {
    jotaiStore.set(agentChatUnreadThreadIdsState.atom, [
      'thread-1',
      'thread-2',
    ]);

    renderChannelItem();

    expect(screen.getByText('Sales').parentElement).toHaveTextContent('· 2');
  });

  it('leaves out threads unread in another channel', () => {
    jotaiStore.set(agentChatUnreadThreadIdsState.atom, [
      'thread-1',
      'thread-3',
    ]);

    renderChannelItem();

    expect(screen.getByText('Sales').parentElement).toHaveTextContent('· 1');
  });

  it('carries no badge when the channel is caught up', () => {
    jotaiStore.set(agentChatUnreadThreadIdsState.atom, []);

    renderChannelItem();

    expect(screen.getByText('Sales').parentElement).not.toHaveTextContent('·');
  });
});
