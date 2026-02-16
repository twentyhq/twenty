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

  it('should use "Ask AI" as default title when no pageTitle is provided', () => {
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

  it('should use explicit pageTitle when provided', () => {
    const { result } = renderWithRecoil();

    act(() => {
      result.current.openAskAIPage({ pageTitle: 'My Chat Title' });
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'My Chat Title',
      }),
    );
  });

  it('should fall back to "Ask AI" when pageTitle is null', () => {
    const { result } = renderWithRecoil();

    act(() => {
      result.current.openAskAIPage({ pageTitle: null });
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'Ask AI',
      }),
    );
  });

  it('should fall back to currentAIChatThreadTitle when no pageTitle is provided', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(currentAIChatThreadTitleState, 'Generated Title');
    });

    act(() => {
      result.current.openAskAIPage();
    });

    expect(navigateCommandMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageTitle: 'Generated Title',
      }),
    );
  });

  it('should prefer explicit pageTitle over currentAIChatThreadTitle', () => {
    const { result } = renderWithRecoil((snapshot) => {
      snapshot.set(currentAIChatThreadTitleState, 'Generated Title');
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
