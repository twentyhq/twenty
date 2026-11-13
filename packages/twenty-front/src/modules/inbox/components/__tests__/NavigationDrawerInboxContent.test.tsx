import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, within } from '@testing-library/react';
import { atom, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerInboxContent } from '@/inbox/components/NavigationDrawerInboxContent';
import { setInboxThreadList } from '@/inbox/testing/setInboxThreadList';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { type DirectMessageSidebarItem } from '@/inbox/types/DirectMessageSidebarItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type InboxChannel } from '@/inbox/types/InboxChannel';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const buildThread = (id: string, title: string): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

const DIRECT_MESSAGE_PEER_ID = 'peer-member';

const buildDirectMessageThread = (id: string): AiChatThreadRecord => ({
  ...buildThread(id, 'Direct message'),
  conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  directMessageFirstWorkspaceMemberId: mockedWorkspaceMemberData.id,
  directMessageSecondWorkspaceMemberId: DIRECT_MESSAGE_PEER_ID,
});

const mockFavoriteThreadsAtom = atom<InboxThreadListItemData[]>([]);
const mockFavoriteChannelsAtom = atom<InboxChannel[]>([]);
let mockThreads: AiChatThreadRecord[] = [];

jest.mock('@/inbox/states/selectors/inboxFavoriteThreadsSelector', () => ({
  inboxFavoriteThreadsSelector: {
    type: 'Selector',
    key: 'inboxFavoriteThreadsSelector',
    get atom() {
      return mockFavoriteThreadsAtom;
    },
  },
}));

jest.mock('@/inbox/states/selectors/inboxFavoriteChannelsSelector', () => ({
  inboxFavoriteChannelsSelector: {
    type: 'Selector',
    key: 'inboxFavoriteChannelsSelector',
    get atom() {
      return mockFavoriteChannelsAtom;
    },
  },
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => false,
}));

jest.mock('@/inbox/components/NavigationDrawerInboxChannelItem', () => ({
  NavigationDrawerInboxChannelItem: ({
    channel,
  }: {
    channel: InboxChannel;
  }) => <div>{channel.name}</div>,
}));

jest.mock('@/inbox/components/NavigationDrawerDirectMessageItem', () => ({
  NavigationDrawerDirectMessageItem: ({
    directMessage,
  }: {
    directMessage: DirectMessageSidebarItem;
  }) => <div>{directMessage.peer?.name}</div>,
}));

jest.mock('@/inbox/components/OpenDirectMessageButton', () => ({
  OpenDirectMessageButton: () => null,
}));

jest.mock('@/inbox/components/NavigationDrawerInboxThreadItem', () => ({
  NavigationDrawerInboxThreadItem: ({
    thread,
  }: {
    thread: InboxThreadListItemData;
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

jest.mock('@/inbox/hooks/useInboxThreadList', () => ({
  useInboxThreadList: () => ({ threads: mockThreads, isLoading: false }),
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

jest.mock('@/inbox/components/NavigationDrawerInboxTriageSection', () => ({
  NavigationDrawerInboxTriageSection: () => <nav aria-label="Triage" />,
}));

let mockIsInboxEnabled = true;
let mockIsDirectMessageEnabled = true;
const mockDirectMessageFeatureFlagKey =
  FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: string) =>
    featureFlagKey === mockDirectMessageFeatureFlagKey
      ? mockIsDirectMessageEnabled
      : mockIsInboxEnabled,
}));

jest.mock('@/inbox/components/NavigationDrawerInboxChannelsSection', () => ({
  NavigationDrawerInboxChannelsSection: () => null,
}));

jest.mock('@/inbox/components/InboxThreadListFetchMoreTrigger', () => ({
  InboxThreadListFetchMoreTrigger: () => <div>Load more chats</div>,
}));

jest.mock('@/inbox/components/NavigationDrawerInboxThreadSection', () => ({
  NavigationDrawerInboxThreadSection: ({
    title,
    threads,
  }: {
    title: string;
    threads: InboxThreadListItemData[];
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
        <NavigationDrawerInboxContent />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatContent', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockIsInboxEnabled = true;
    mockIsDirectMessageEnabled = true;
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
        applicationId: 'workspace-custom-application-id',
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
    mockIsInboxEnabled = false;
    jotaiStore.set(mockFavoriteChannelsAtom, [
      {
        __typename: 'AgentChatChannel',
        id: 'channel-1',
        name: 'Support',
        icon: null,
        color: null,
        position: 1,
        roleIds: [],
        applicationId: 'workspace-custom-application-id',
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
    mockIsInboxEnabled = false;

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
    mockIsInboxEnabled = false;
    mockThreads = Array.from({ length: 7 }, (_, index) =>
      buildThread(`chat-${index}`, `Chat ${index}`),
    );

    const { getByRole, getByText } = renderContent();

    const recents = getByRole('region', { name: 'Recent' });

    expect(within(recents).getAllByText(/^Chat \d$/)).toHaveLength(7);
    expect(getByText('Load more chats')).toBeInTheDocument();
  });

  it('lists direct messages in their own section instead of Recent', () => {
    mockThreads = [
      buildThread('chat-1', 'Pipeline review'),
      buildDirectMessageThread('direct-message'),
    ];
    setInboxThreadList(jotaiStore, mockThreads);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
      {
        ...mockedWorkspaceMemberData,
        id: DIRECT_MESSAGE_PEER_ID,
        name: { firstName: 'Alice', lastName: 'Example' },
      },
    ]);

    const { getByRole } = renderContent();

    const directMessages = getByRole('region', { name: 'Direct messages' });
    const recents = getByRole('region', { name: 'Recent' });

    expect(within(directMessages).getByText('Alice Example')).toBeVisible();
    expect(within(recents).getByText('Pipeline review')).toBeVisible();
    expect(within(recents).queryByText('Direct message')).toBeNull();
  });

  it('keeps direct messages in Recent while direct messages are off', () => {
    mockIsDirectMessageEnabled = false;
    mockThreads = [buildDirectMessageThread('direct-message')];

    const { getByRole, queryByRole } = renderContent();

    expect(queryByRole('region', { name: 'Direct messages' })).toBeNull();
    expect(
      within(getByRole('region', { name: 'Recent' })).getByText(
        'Direct message',
      ),
    ).toBeVisible();
  });

  it('shows no Favorites section without favorite chats or channels', () => {
    jotaiStore.set(mockFavoriteThreadsAtom, []);

    const { queryByRole } = renderContent();

    expect(queryByRole('region', { name: 'Favorites' })).toBeNull();
  });
});
