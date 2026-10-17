import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, within } from '@testing-library/react';
import { atom, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type AgentChatChannel } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const buildThread = (id: string, title: string): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

const mockFavoriteThreadsAtom = atom<AgentChatThreadListItem[]>([]);
const mockFavoriteChannelsAtom = atom<AgentChatChannel[]>([]);
let mockThreads: AgentChatThreadRecord[] = [];

jest.mock('@/ai/states/selectors/agentChatFavoriteThreadsSelector', () => ({
  agentChatFavoriteThreadsSelector: {
    type: 'Selector',
    key: 'agentChatFavoriteThreadsSelector',
    get atom() {
      return mockFavoriteThreadsAtom;
    },
  },
}));

jest.mock('@/ai/states/selectors/agentChatFavoriteChannelsSelector', () => ({
  agentChatFavoriteChannelsSelector: {
    type: 'Selector',
    key: 'agentChatFavoriteChannelsSelector',
    get atom() {
      return mockFavoriteChannelsAtom;
    },
  },
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => false,
}));

jest.mock('@/ai/components/NavigationDrawerAiChatChannelItem', () => ({
  NavigationDrawerAiChatChannelItem: ({
    channel,
  }: {
    channel: AgentChatChannel;
  }) => <div>{channel.name}</div>,
}));

jest.mock('@/ai/components/NavigationDrawerAiChatThreadItem', () => ({
  NavigationDrawerAiChatThreadItem: ({
    thread,
  }: {
    thread: AgentChatThreadListItem;
  }) => <div>{thread.title}</div>,
}));

jest.mock(
  '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection',
  () => ({
    CollapsibleNavigationDrawerSection: ({
      label,
      children,
    }: {
      label: string;
      children: ReactNode;
    }) => <section aria-label={label}>{children}</section>,
  }),
);

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({ threads: mockThreads, loading: false }),
}));

jest.mock('@/ai/hooks/useAiChatThreadClick', () => ({
  useAiChatThreadClick: () => ({ handleThreadClick: jest.fn() }),
}));

jest.mock(
  '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded',
  () => ({
    useIsNavigationDrawerContentExpanded: () => true,
  }),
);

jest.mock('@/ai/components/NavigationDrawerAiChatTriageSection', () => ({
  NavigationDrawerAiChatTriageSection: () => <nav aria-label="Triage" />,
}));

let mockIsAiChatInboxEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsAiChatInboxEnabled,
}));

jest.mock('@/ai/components/NavigationDrawerAiChatChannelsSection', () => ({
  NavigationDrawerAiChatChannelsSection: () => null,
}));

jest.mock('@/ai/components/AgentChatThreadsFetchMoreTrigger', () => ({
  AgentChatThreadsFetchMoreTrigger: () => <div>Load more chats</div>,
}));

jest.mock('@/ai/components/NavigationDrawerAiChatThreadSection', () => ({
  NavigationDrawerAiChatThreadSection: ({
    title,
    threads,
  }: {
    title: string;
    threads: AgentChatThreadListItem[];
  }) => (
    <section aria-label={title}>
      {threads.map((thread) => (
        <div key={thread.id}>{thread.title}</div>
      ))}
    </section>
  ),
}));

const renderContent = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <NavigationDrawerAiChatContent />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatContent', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockIsAiChatInboxEnabled = true;
    mockThreads = [
      buildThread('chat-1', 'Pipeline review'),
      buildThread('chat-2', 'Quarterly plan'),
    ];
  });

  it('lists favorite chats apart from recent chats', () => {
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-2', title: 'Quarterly plan', deletedAt: null },
    ]);

    const { getByRole } = renderContent();

    const favorites = getByRole('region', { name: 'Favorites' });
    const recents = getByRole('region', { name: 'Recent' });

    expect(within(favorites).getByText('Quarterly plan')).toBeInTheDocument();
    expect(within(recents).getByText('Pipeline review')).toBeInTheDocument();
    expect(within(recents).queryByText('Quarterly plan')).toBeNull();
  });

  it('lists favorite channels before favorite chats', () => {
    jotaiStore.set(mockFavoriteChannelsAtom, [
      {
        __typename: 'AgentChatChannel',
        id: 'channel-1',
        name: 'Support',
        icon: null,
        color: null,
        position: 1,
        roleIds: [],
        isCustom: true,
        isAccessible: true,
      },
    ]);
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-2', title: 'Quarterly plan', deletedAt: null },
    ]);

    const { getByRole } = renderContent();

    const favorites = getByRole('region', { name: 'Favorites' });

    expect(
      within(favorites)
        .getAllByText(/Support|Quarterly plan/)
        .map((element) => element.textContent),
    ).toEqual(['Support', 'Quarterly plan']);
  });

  it('leaves favorite channels out while the inbox feature flag is off', () => {
    mockIsAiChatInboxEnabled = false;
    jotaiStore.set(mockFavoriteChannelsAtom, [
      {
        __typename: 'AgentChatChannel',
        id: 'channel-1',
        name: 'Support',
        icon: null,
        color: null,
        position: 1,
        roleIds: [],
        isCustom: true,
        isAccessible: true,
      },
    ]);
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-2', title: 'Quarterly plan', deletedAt: null },
    ]);

    const { getByRole, queryByText } = renderContent();

    const favorites = getByRole('region', { name: 'Favorites' });

    expect(within(favorites).getByText('Quarterly plan')).toBeInTheDocument();
    expect(queryByText('Support')).toBeNull();
  });

  it('shows the triage section with the inbox feature flag on', () => {
    const { getByRole } = renderContent();

    expect(getByRole('navigation', { name: 'Triage' })).toBeInTheDocument();
  });

  it('hides the triage section while the inbox feature flag is off', () => {
    mockIsAiChatInboxEnabled = false;

    const { queryByRole } = renderContent();

    expect(queryByRole('navigation', { name: 'Triage' })).toBeNull();
    expect(queryByRole('region', { name: 'Recent' })).toBeInTheDocument();
  });

  it('caps Recent at 5 non-favorite chats with the inbox feature flag on', () => {
    mockThreads = Array.from({ length: 8 }, (_, index) =>
      buildThread(`chat-${index}`, `Chat ${index}`),
    );
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-0', title: 'Chat 0', deletedAt: null },
    ]);

    const { getByRole, queryByText } = renderContent();

    const recents = getByRole('region', { name: 'Recent' });

    expect(within(recents).getAllByText(/^Chat \d$/)).toHaveLength(5);
    expect(within(recents).queryByText('Chat 0')).toBeNull();
    expect(within(recents).getByText('Chat 5')).toBeInTheDocument();
    expect(within(recents).queryByText('Chat 6')).toBeNull();
    expect(queryByText('Load more chats')).toBeNull();
  });

  it('does not cap Recent while the inbox feature flag is off', () => {
    mockIsAiChatInboxEnabled = false;
    mockThreads = Array.from({ length: 7 }, (_, index) =>
      buildThread(`chat-${index}`, `Chat ${index}`),
    );

    const { getByRole, getByText } = renderContent();

    const recents = getByRole('region', { name: 'Recent' });

    expect(within(recents).getAllByText(/^Chat \d$/)).toHaveLength(7);
    expect(getByText('Load more chats')).toBeInTheDocument();
  });

  it('shows no Favorites section without favorite chats or channels', () => {
    jotaiStore.set(mockFavoriteThreadsAtom, []);

    const { queryByRole } = renderContent();

    expect(queryByRole('region', { name: 'Favorites' })).toBeNull();
  });
});
