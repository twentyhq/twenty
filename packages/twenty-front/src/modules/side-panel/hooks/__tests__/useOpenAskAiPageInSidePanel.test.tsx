import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/icon';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

const navigateSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
    openSidePanelMenu: jest.fn(),
    closeSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAiPageInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isSidePanelOpenedState.atom, false);
    jotaiStore.set(agentChatUISessionStartTimeState.atom, null);
    jotaiStore.set(currentWorkspaceState.atom, null);
    window.history.pushState({}, '', '/objects/companies');
  });

  it('should navigate to AskAI page with correct defaults', () => {
    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.AskAI,
        pageTitle: 'Ask AI',
        pageIcon: IconSparkles,
      }),
    );
  });

  it('should use resetNavigationStack from argument when provided', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage({ resetNavigationStack: false });
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: false,
      }),
    );
  });

  it('should default resetNavigationStack to isSidePanelOpened', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: true,
      }),
    );
  });

  it('should not open the panel AskAI page while on the AI chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should not open the AskAI page for a suspended workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    } as CurrentWorkspace);

    const { result } = renderHook(() => useOpenAskAiPageInSidePanel(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAskAiPage();
    });

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(agentChatUISessionStartTimeState.atom)).toBeNull();
  });
});
