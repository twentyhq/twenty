import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useOpenAiChatPage } from '@/ai/hooks/useOpenAiChatPage';
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
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAiChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/objects/people');
  });

  it('should open a new chat and remember where to collapse back to', () => {
    const { result } = renderHook(() => useOpenAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAiChatPage();
    });

    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/chat', {
      state: { returnLocation: '/objects/people' },
    });
  });

  it('should keep the current view and query in the return location', () => {
    window.history.pushState({}, '', '/objects/people?viewId=42');

    const { result } = renderHook(() => useOpenAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAiChatPage();
    });

    expect(navigateMock).toHaveBeenCalledWith('/chat', {
      state: { returnLocation: '/objects/people?viewId=42' },
    });
  });

  it('should open an existing thread', () => {
    const { result } = renderHook(() => useOpenAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAiChatPage({
        threadId: '20202020-0000-4000-8000-000000000001',
      });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      '/chat/20202020-0000-4000-8000-000000000001',
      expect.anything(),
    );
  });

  it('should ignore a draft thread that has no thread id yet', () => {
    const { result } = renderHook(() => useOpenAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAiChatPage({ threadId: 'new-thread-draft' });
    });

    expect(navigateMock).toHaveBeenCalledWith('/chat', expect.anything());
  });

  it('should not navigate while already on the AI chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useOpenAiChatPage(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openAiChatPage();
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
  });
});
