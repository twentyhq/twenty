import { act, renderHook } from '@testing-library/react';
import { AppPath } from 'twenty-shared/types';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';

const navigateAppMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

const THREAD_A = '11111111-1111-4111-8111-111111111111';

describe('useProjectAiChatThreadToUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState(null, '', '/');
  });

  it('should write the selected thread into the chat url', () => {
    window.history.pushState(null, '', '/chat');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

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
    window.history.pushState(null, '', `/chat/${THREAD_A}`);

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

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

  it('should carry the history entry state forward', () => {
    window.history.pushState(
      { usr: { returnLocation: '/objects/people' } },
      '',
      '/chat',
    );

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

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

  it('should read the entry state as it is when called, not when rendered', () => {
    window.history.pushState(null, '', '/chat');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    window.history.pushState(
      { usr: { returnLocation: '/objects/companies' } },
      '',
      '/chat',
    );

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_A },
      undefined,
      { replace: true, state: { returnLocation: '/objects/companies' } },
    );
  });

  it('should leave the url alone outside the chat page', () => {
    window.history.pushState(null, '', '/objects/companies');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).not.toHaveBeenCalled();
  });
});
