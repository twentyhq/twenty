import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

import { isSidePanelItemShowingAiChat } from '@/ai/utils/isSidePanelItemShowingAiChat';
import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

const buildRoutedPage = (pathname: string): SidePanelNavigationStackItem => ({
  page: SidePanelPages.RoutedPage,
  pageTitle: 'Page',
  pageIcon: IconDotsVertical,
  pageId: 'page-id',
  routedLocation: { pathname, search: '', hash: '', state: null, key: 'key' },
});

describe('isSidePanelItemShowingAiChat', () => {
  it('recognizes the current chat object name after a rename', () => {
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: buildRoutedPage('/object/inboxThread/chat-id'),
        chatObjectNameSingular: 'inboxThread',
      }),
    ).toBe(true);
  });

  it('recognizes Ask AI without object metadata and rejects other routes', () => {
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: {
          page: SidePanelPages.AskAI,
          pageTitle: 'Ask AI',
          pageIcon: IconDotsVertical,
          pageId: 'ask-ai',
        },
      }),
    ).toBe(true);
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: buildRoutedPage('/artifact'),
      }),
    ).toBe(false);
  });

  it('recognizes Ask AI and a chat record page', () => {
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: {
          page: SidePanelPages.AskAI,
          pageTitle: 'Ask AI',
          pageIcon: IconDotsVertical,
          pageId: 'ask-ai',
        },
        chatObjectNameSingular: 'agentChatThread',
      }),
    ).toBe(true);
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: buildRoutedPage(
          '/object/agentChatThread/20202020-0000-4000-8000-0000000000aa',
        ),
        chatObjectNameSingular: 'agentChatThread',
      }),
    ).toBe(true);
  });

  it('leaves other pages and an empty panel alone', () => {
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: buildRoutedPage(
          '/object/company/20202020-0000-4000-8000-0000000000aa',
        ),
        chatObjectNameSingular: 'agentChatThread',
      }),
    ).toBe(false);
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: buildRoutedPage('/artifact'),
        chatObjectNameSingular: 'agentChatThread',
      }),
    ).toBe(false);
    expect(
      isSidePanelItemShowingAiChat({
        sidePanelItem: undefined,
        chatObjectNameSingular: 'agentChatThread',
      }),
    ).toBe(false);
  });
});
