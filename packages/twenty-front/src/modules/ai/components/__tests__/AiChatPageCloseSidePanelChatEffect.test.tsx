import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
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

const setCurrentSidePanelPage = (
  page: ActiveSidePanelPage,
  routedPathname = '/test',
) => {
  const navigationItem: SidePanelNavigationStackItem =
    page === SidePanelPages.RoutedPage
      ? {
          page,
          pageTitle: 'Test page',
          pageIcon: IconDotsVertical,
          pageId: 'test-page',
          routedLocation: {
            pathname: routedPathname,
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

describe('AiChatPageCloseSidePanelChatEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('should dismiss a panel chat the browser navigated back onto', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    render(<AiChatPageCloseSidePanelChatEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should dismiss a chat record opened in the panel', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(
      SidePanelPages.RoutedPage,
      '/object/agentChatThread/20202020-0000-4000-8000-0000000000aa',
    );

    render(<AiChatPageCloseSidePanelChatEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should leave an open artifact panel alone', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.RoutedPage);

    render(<AiChatPageCloseSidePanelChatEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the panel is closed', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, false);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    render(<AiChatPageCloseSidePanelChatEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should not fight a panel chat opened after mount', () => {
    render(<AiChatPageCloseSidePanelChatEffect />, { wrapper: Wrapper });

    jotaiStore.set(isSidePanelOpenedState.atom, true);
    setCurrentSidePanelPage(SidePanelPages.AskAI);

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
