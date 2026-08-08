import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';

const navigateAppMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

const THREAD_A = '11111111-1111-4111-8111-111111111111';

// The hook decides whether to write from window.location at call time, since
// it can run from an async callback that outlived a route change, and reads
// the history entry's state from the router.
const getWrapper =
  (initialEntry: { pathname: string; state?: unknown }) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );

describe('useProjectAiChatThreadToUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write the selected thread into the chat url', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl(), {
      wrapper: getWrapper({ pathname: '/chat' }),
    });

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_A },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should clear the url param for a draft thread', () => {
    window.history.pushState({}, '', `/chat/${THREAD_A}`);

    const { result } = renderHook(() => useProjectAiChatThreadToUrl(), {
      wrapper: getWrapper({ pathname: `/chat/${THREAD_A}` }),
    });

    act(() => {
      result.current.projectAiChatThreadToUrl(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: null },
      undefined,
      { replace: true, state: null },
    );
  });

  // The expand button records where it came from on the history entry, so a
  // thread switch must carry it forward or collapsing loses its way back.
  it('should carry the history entry state forward', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl(), {
      wrapper: getWrapper({
        pathname: '/chat',
        state: { returnLocation: '/objects/people' },
      }),
    });

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_A },
      undefined,
      { replace: true, state: { returnLocation: '/objects/people' } },
    );
  });

  it('should leave the url alone outside the chat page', () => {
    window.history.pushState({}, '', '/objects/companies');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl(), {
      wrapper: getWrapper({ pathname: '/objects/companies' }),
    });

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).not.toHaveBeenCalled();
  });
});
