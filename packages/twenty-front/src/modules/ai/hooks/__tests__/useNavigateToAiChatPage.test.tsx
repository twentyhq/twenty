import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useExpandAskAiSidePanelPage } from '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();
const closeSidePanelMenuMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: closeSidePanelMenuMock }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
  </I18nProvider>
);

describe('useNavigateToAiChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, false);
    window.history.pushState({}, '', '/objects/people');
  });

  it('blocks an already-open chat from expanding until layout editing ends', () => {
    const { result } = renderHook(() => useExpandAskAiSidePanelPage(), {
      wrapper: Wrapper,
    });
    const expandBeforeEditing = result.current.expand;

    expect(result.current.disabledReason).toBeUndefined();

    act(() => {
      jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    });

    expect(result.current.disabledReason).toBe(
      'Finish editing the layout to expand chat',
    );

    act(() => {
      result.current.expand();
      expandBeforeEditing();
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();

    act(() => {
      jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, false);
    });

    expect(result.current.disabledReason).toBeUndefined();

    act(() => {
      result.current.expand();
    });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(closeSidePanelMenuMock).toHaveBeenCalledTimes(1);
  });

  it('should open a new chat and remember where to collapse back to', () => {
    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage();
    });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/chat', {
      state: { returnLocation: '/objects/people' },
    });
  });

  it('should keep the current view and query in the return location', () => {
    window.history.pushState({}, '', '/objects/people?viewId=42');

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage();
    });

    expect(navigateMock).toHaveBeenCalledWith('/chat', {
      state: { returnLocation: '/objects/people?viewId=42' },
    });
  });

  it('should open an existing thread', () => {
    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({
        threadId: '20202020-0000-4000-8000-000000000001',
      });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      '/chat/20202020-0000-4000-8000-000000000001',
      expect.anything(),
    );
  });

  it('should ignore a draft thread that has no thread id yet', () => {
    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ threadId: 'new-thread-draft' });
    });

    expect(navigateMock).toHaveBeenCalledWith('/chat', expect.anything());
  });

  it('should not navigate while already on the AI chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage();
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
