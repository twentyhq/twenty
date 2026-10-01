import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMessage } from 'twenty-ui/icon';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const NETWORK_ERROR = new Error('Failed to fetch');

const openRecordInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel }),
}));

jest.mock('@/ai/components/AgentChatThreadPreviewsEffect', () => ({
  AgentChatThreadPreviewsEffect: () => null,
}));

jest.mock('@/ai/components/AiChatThreadActionsDropdown', () => ({
  AiChatThreadActionsDropdown: () => null,
}));

const THREAD: AgentChatThreadRecord = {
  __typename: 'AgentChatThread',
  id: '20202020-0000-4000-8000-0000000000aa',
  title: 'Pricing questions',
  deletedAt: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  lastActivityAt: '2026-10-01T10:00:00.000Z',
};

const renderContent = ({
  loading = false,
  error,
  onRetry = jest.fn(),
  threads = [],
  openThreadIdInSidePanel,
}: {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  threads?: AgentChatThreadRecord[];
  openThreadIdInSidePanel?: string;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <ChatThreadsCardContent
          loading={loading}
          error={error}
          onRetry={onRetry}
          onDetachThread={jest.fn()}
          threads={threads}
        />
      </MemoryRouter>
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        onInitializeJotaiStore: (store) => {
          if (openThreadIdInSidePanel === undefined) {
            return;
          }

          store.set(isSidePanelOpenedState.atom, true);
          store.set(sidePanelNavigationStackState.atom, [
            {
              page: SidePanelPages.RoutedPage,
              pageTitle: 'Pricing questions',
              pageIcon: IconMessage,
              pageId: 'panel-page-1',
              routedFlowStateScopeId: 'panel-page-1',
              routedLocation: {
                pathname: `/object/agentChatThread/${openThreadIdInSidePanel}`,
                search: '',
                hash: '',
                state: null,
                key: 'chat',
              },
            },
          ]);
        },
      }),
    },
  );

describe('ChatThreadsCardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens a chat on top of the side panel, so back returns to the record', async () => {
    renderContent({ threads: [THREAD] });

    await userEvent.click(screen.getByText('Pricing questions'));

    expect(openRecordInSidePanel).toHaveBeenCalledWith({
      recordId: THREAD.id,
      objectNameSingular: 'agentChatThread',
    });
  });

  it('leaves the side panel alone when the chat is already open in it', async () => {
    renderContent({ threads: [THREAD], openThreadIdInSidePanel: THREAD.id });

    await userEvent.click(screen.getByText('Pricing questions'));

    expect(openRecordInSidePanel).not.toHaveBeenCalled();
  });

  it('does not claim the record has no conversations while loading', () => {
    renderContent({ loading: true });

    expect(screen.queryByText('No conversations')).not.toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the conversations"),
    ).not.toBeInTheDocument();
  });

  it('reports a failed load rather than an empty record, and retries', async () => {
    const onRetry = jest.fn();

    renderContent({ error: NETWORK_ERROR, onRetry });

    expect(
      screen.getByText("We couldn't load the conversations"),
    ).toBeInTheDocument();
    expect(screen.queryByText('No conversations')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state once the record is known to have none', () => {
    renderContent({});

    expect(screen.getByText('No conversations')).toBeInTheDocument();
  });
});
