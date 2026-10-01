import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMessage } from 'twenty-ui/icon';

import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

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

const clickThread = async (
  surface: AiChatThreadActionsSurface,
  { isOpenInSidePanel = false }: { isOpenInSidePanel?: boolean } = {},
) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      if (!isOpenInSidePanel) {
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
            pathname: `/object/agentChatThread/${THREAD.id}`,
            search: '',
            hash: '',
            state: null,
            key: 'chat',
          },
        },
      ]);
    },
  });

  render(
    <MetadataAndApolloMocksWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <AiChatThreadList
            threads={[THREAD]}
            surface={surface}
            isGroupedByDate={false}
          />
        </MemoryRouter>
      </I18nProvider>
    </MetadataAndApolloMocksWrapper>,
  );

  await userEvent.click(screen.getByText('Pricing questions'));
};

describe('AiChatThreadList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens a chat from the inbox in place of what the side panel showed', async () => {
    await clickThread(AI_CHAT_THREAD_ACTIONS_SURFACE.INBOX_PAGE);

    expect(openRecordInSidePanel).toHaveBeenCalledWith({
      recordId: THREAD.id,
      objectNameSingular: 'agentChatThread',
      resetNavigationStack: true,
    });
  });

  it('leaves the side panel alone when the chat is already open in it', async () => {
    await clickThread(AI_CHAT_THREAD_ACTIONS_SURFACE.INBOX_PAGE, {
      isOpenInSidePanel: true,
    });

    expect(openRecordInSidePanel).not.toHaveBeenCalled();
  });

  it('opens a chat from a record on top of the side panel, so back returns to it', async () => {
    await clickThread(AI_CHAT_THREAD_ACTIONS_SURFACE.RECORD_PAGE);

    expect(openRecordInSidePanel).toHaveBeenCalledWith({
      recordId: THREAD.id,
      objectNameSingular: 'agentChatThread',
      resetNavigationStack: false,
    });
  });
});
