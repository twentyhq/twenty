import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

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

  // The reachable case: collapsing opens the panel chat and leaves the page,
  // so pressing Back returns here with the same conversation in the panel.
  it('should dismiss a panel chat the browser navigated back onto', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelPageState.atom, SidePanelPages.AskAI);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should leave an open artifact panel alone', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelPageState.atom, SidePanelPages.ViewRecordIndex);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the panel is closed', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, false);
    jotaiStore.set(sidePanelPageState.atom, SidePanelPages.AskAI);

    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  // A handoff opens the panel chat on the way out of the page; reading the
  // panel once on mount is what keeps this from fighting it.
  it('should not fight a panel chat opened after mount', () => {
    render(<AiChatPageCloseAskAiPanelEffect />, { wrapper: Wrapper });

    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelPageState.atom, SidePanelPages.AskAI);

    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
