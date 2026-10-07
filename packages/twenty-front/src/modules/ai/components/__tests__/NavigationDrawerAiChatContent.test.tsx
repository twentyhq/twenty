import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, within } from '@testing-library/react';
import { atom, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
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
  NavigationDrawerAiChatTriageSection: () => null,
}));

jest.mock('@/ai/components/NavigationDrawerAiChatChannelsSection', () => ({
  NavigationDrawerAiChatChannelsSection: () => null,
}));

jest.mock('@/ai/components/AgentChatThreadsFetchMoreTrigger', () => ({
  AgentChatThreadsFetchMoreTrigger: () => null,
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
    mockThreads = [
      buildThread('chat-1', 'Pipeline review'),
      buildThread('chat-2', 'Quarterly plan'),
    ];
  });

  it('lists favorite chats, leaving the rest to triage and channels', () => {
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-2', title: 'Quarterly plan', deletedAt: null },
    ]);

    const { getByRole, queryByRole, queryByText } = renderContent();

    const favorites = getByRole('region', { name: 'Favorites' });

    expect(within(favorites).getByText('Quarterly plan')).toBeInTheDocument();
    expect(queryByRole('region', { name: 'Recent' })).toBeNull();
    expect(queryByText('Pipeline review')).toBeNull();
  });

  it('shows no Favorites section without favorite chats', () => {
    jotaiStore.set(mockFavoriteThreadsAtom, []);

    const { queryByRole } = renderContent();

    expect(queryByRole('region', { name: 'Favorites' })).toBeNull();
  });
});
