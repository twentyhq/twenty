import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useExpandAskAiSidePanelPage } from '@/side-panel/pages/ask-ai/hooks/useExpandAskAiSidePanelPage';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const CHANNEL_ID = '5e8c8a1c-6d17-4d75-8d47-3a6e1a2d0b11';
const CHANNEL_THREAD_ID = '20202020-0000-4000-8000-000000000002';

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
    resetJotaiStore();
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, false);
    jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [{ id: CHANNEL_THREAD_ID, channelId: CHANNEL_ID }],
      draft: [],
      status: 'up-to-date',
    });
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

  it('opens a thread of a channel on that channel page', () => {
    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ threadId: CHANNEL_THREAD_ID });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/channels/${CHANNEL_ID}/${CHANNEL_THREAD_ID}`,
      { state: { returnLocation: '/objects/people' } },
    );
  });

  it('opens a thread of an unreadable channel on the standalone chat page', () => {
    jotaiStore.set(metadataStoreState.atomFamily('agentChatChannels'), {
      current: [],
      draft: [],
      status: 'up-to-date',
    });

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ threadId: CHANNEL_THREAD_ID });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/${CHANNEL_THREAD_ID}`,
      expect.anything(),
    );
  });

  it('still opens the channel page once that channel is readable', () => {
    jotaiStore.set(metadataStoreState.atomFamily('agentChatChannels'), {
      current: [{ id: CHANNEL_ID }],
      draft: [],
      status: 'up-to-date',
    });

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ threadId: CHANNEL_THREAD_ID });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/channels/${CHANNEL_ID}/${CHANNEL_THREAD_ID}`,
      expect.anything(),
    );
  });

  it('opens a new chat of a channel on that channel page', () => {
    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ channelId: CHANNEL_ID });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/channels/${CHANNEL_ID}`,
      expect.anything(),
    );
  });

  it('should not navigate while already on the page of that channel', () => {
    window.history.pushState({}, '', `/chat/channels/${CHANNEL_ID}`);

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage({ threadId: CHANNEL_THREAD_ID });
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('leaves a channel page for a chat outside any channel', () => {
    window.history.pushState({}, '', `/chat/channels/${CHANNEL_ID}`);

    const { result } = renderHook(() => useNavigateToAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.navigateToAiChatPage();
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
