import { renderHook, act } from '@testing-library/react';
import { type MutableSnapshot, RecoilRoot } from 'recoil';

import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { IconSparkles } from 'twenty-ui/display';

const navigateCommandMenuMock = jest.fn();

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    navigateCommandMenu: navigateCommandMenuMock,
    openCommandMenu: jest.fn(),
    closeCommandMenu: jest.fn(),
    toggleCommandMenu: jest.fn(),
  }),
}));

const renderWithRecoil = (
  initializeState?: (snapshot: MutableSnapshot) => void,
) =>
  renderHook(() => useOpenAskAIPageInCommandMenu(), {
    wrapper: ({ children }) => (
      <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
    ),
  });

describe('useOpenAskAIPageInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use "Ask AI" as title when no thread title exists', () => {
    const { result } = renderWithRecoil();

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: CommandMenuPages.AskAI,
        pageTitle: 'Ask AI',
        pageIcon: IconSparkles,
      }),
    );
  });

  it('should use currentAIChatThreadTitle when it exists', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(currentAIChatThreadTitleState, 'My Chat Title');
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'My Chat Title',
      }),
    );
  });

  it('should prefer explicit pageTitle over thread title state', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(currentAIChatThreadTitleState, 'Thread Title');
    });

    act(() => {
      result.current.openAskAIPage({ pageTitle: 'Explicit Title' });
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'Explicit Title',
      }),
    );
  });

  it('should fall back to "Ask AI" when thread title is null', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(currentAIChatThreadTitleState, null);
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'Ask AI',
      }),
    );
  });

  it('should use resetNavigationStack from argument when provided', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(isCommandMenuOpenedState, true);
    });

    act(() => {
      result.current.openAskAIPage({ resetNavigationStack: false });
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: false,
      }),
    );
  });

  it('should default resetNavigationStack to isCommandMenuOpened', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(isCommandMenuOpenedState, true);
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resetNavigationStack: true,
      }),
    );
  });
});
