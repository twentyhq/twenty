import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, within } from '@testing-library/react';
import { atom, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { LegacyAiChatNavigationDrawerContent } from '@/legacy-ai-chat/components/LegacyAiChatNavigationDrawerContent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

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

const mockFavoriteThreadsAtom = atom<InboxThreadListItemData[]>([]);
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

jest.mock('@/inbox/hooks/useInboxThreadList', () => ({
  useInboxThreadList: () => ({ threads: mockThreads, isLoading: false }),
}));

jest.mock('@/ai/hooks/useAiChatPageThreadId', () => ({
  useAiChatPageThreadId: () => null,
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

jest.mock('@/inbox/components/InboxThreadListFetchMoreTrigger', () => ({
  InboxThreadListFetchMoreTrigger: () => <div>Load more chats</div>,
}));

const mockThreadSection = ({
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
);

jest.mock('@/inbox/components/NavigationDrawerInboxThreadSection', () => ({
  NavigationDrawerInboxThreadSection: (props: {
    title: string;
    threads: InboxThreadListItemData[];
  }) => mockThreadSection(props),
}));

jest.mock('@/inbox/components/NavigationDrawerInboxFavoritesSection', () => ({
  NavigationDrawerInboxFavoritesSection: ({
    threads,
  }: {
    threads: InboxThreadListItemData[];
  }) =>
    threads.length > 0
      ? mockThreadSection({ title: 'Favorites', threads })
      : null,
}));

const renderContent = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <LegacyAiChatNavigationDrawerContent />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('LegacyAiChatNavigationDrawerContent', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockThreads = [];
  });

  it('lists every recent chat outside favorites and loads more', () => {
    mockThreads = Array.from({ length: 7 }, (_, index) =>
      buildThread(`chat-${index}`, `Chat ${index}`),
    );
    jotaiStore.set(mockFavoriteThreadsAtom, [
      { id: 'chat-0', title: 'Chat 0', deletedAt: null },
    ]);

    const { getByRole, getByText } = renderContent();

    const favorites = getByRole('region', { name: 'Favorites' });
    const recents = getByRole('region', { name: 'Recent' });

    expect(within(favorites).getByText('Chat 0')).toBeInTheDocument();
    expect(within(recents).getAllByText(/^Chat \d$/)).toHaveLength(6);
    expect(within(recents).queryByText('Chat 0')).toBeNull();
    expect(getByText('Load more chats')).toBeInTheDocument();
  });
});
