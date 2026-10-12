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
  it('recognizes Ask AI and a chat record page', () => {
    expect(
      isSidePanelItemShowingAiChat({
        page: SidePanelPages.AskAI,
        pageTitle: 'Ask AI',
        pageIcon: IconDotsVertical,
        pageId: 'ask-ai',
      }),
    ).toBe(true);
    expect(
      isSidePanelItemShowingAiChat(
        buildRoutedPage(
          '/object/agentChatThread/20202020-0000-4000-8000-0000000000aa',
        ),
      ),
    ).toBe(true);
  });

  it('leaves other pages and an empty panel alone', () => {
    expect(
      isSidePanelItemShowingAiChat(
        buildRoutedPage('/object/company/20202020-0000-4000-8000-0000000000aa'),
      ),
    ).toBe(false);
    expect(isSidePanelItemShowingAiChat(buildRoutedPage('/artifact'))).toBe(
      false,
    );
    expect(isSidePanelItemShowingAiChat(undefined)).toBe(false);
  });
});
