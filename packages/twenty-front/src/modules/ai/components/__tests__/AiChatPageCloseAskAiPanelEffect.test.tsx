import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  type SidePanelNavigationStackItem,
  sidePanelNavigationStackState,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { type ActiveSidePanelPage } from '@/side-panel/types/SidePanelPage';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { IconDotsVertical } from 'twenty-ui/icon';

const setCurrentSidePanelPage = (page: ActiveSidePanelPage) => {
  const navigationItem: SidePanelNavigationStackItem =
    page === SidePanelPages.RoutedPage
      ? {
          page,
          pageTitle: 'Test page',
          pageIcon: IconDotsVertical,
          pageId: 'test-page',
          routedLocation: {
            pathname: '/test',
            search: '',
            hash: '',
            state: null,
            key: 'test',
          },
        }
      : {
          page,
          pageTitle: 'Test page',
          pageIcon: IconDotsVertical,
          pageId: 'test-page',
        };

  jotaiStore.set(sidePanelNavigationStackState.atom, [navigationItem]);
};

const closeSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: closeSidePanelMenuMock }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('AiChatPageCloseAskAiPanelEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('should dismiss a panel chat the browser navigated back onto', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should leave an open artifact panel alone', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.RoutedPage);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the panel is closed', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, false);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should not fight a panel chat opened after mount', () => {
    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
