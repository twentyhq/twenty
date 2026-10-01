import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';

const navigateToAiChatPage = jest.fn();
const openAskAiPage = jest.fn();

jest.mock('@/ai/hooks/useNavigateToAiChatPage', () => ({
  useNavigateToAiChatPage: () => ({ navigateToAiChatPage }),
}));

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState',
  () => {
    const { atom } = jest.requireActual('jotai');

    return {
      useAtomComponentFamilyStateCallbackState: () => () => atom(null),
    };
  },
);

jest.mock('@/ai/hooks/useSelectAiChatThread', () => ({
  useSelectAiChatThread: () => ({ selectAiChatThread: jest.fn() }),
}));

const THREAD = { id: '20202020-0000-4000-8000-0000000000aa', title: 'Chat' };

const renderThreadClick = (shouldOpenInFullPage?: boolean) =>
  renderHook(() => useAiChatThreadClick({ shouldOpenInFullPage }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={createStore()}>{children}</Provider>
    ),
  });

describe('useAiChatThreadClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the thread in the side panel by default', () => {
    const { result } = renderThreadClick();

    result.current.handleThreadClick(THREAD);

    expect(openAskAiPage).toHaveBeenCalled();
    expect(navigateToAiChatPage).not.toHaveBeenCalled();
  });

  it('opens the thread full page when asked', () => {
    const { result } = renderThreadClick(true);

    result.current.handleThreadClick(THREAD);

    expect(navigateToAiChatPage).toHaveBeenCalledWith({ threadId: THREAD.id });
    expect(openAskAiPage).not.toHaveBeenCalled();
  });
});
