import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';

import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/InboxNewThreadPathSegment';
import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectInboxThreadToUrl';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';

const navigateAppMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

const THREAD_A = '11111111-1111-4111-8111-111111111111';

describe('useProjectInboxThreadToUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState(null, '', '/');
  });

  it('should write the selected thread into the chat url', () => {
    window.history.pushState(null, '', '/chat');

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_A },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should clear the url param for the new chat', () => {
    window.history.pushState(null, '', `/chat/${THREAD_A}`);

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(
        getDefaultStore().get(newInboxThreadIdState.atom),
      );
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: null },
      undefined,
      { replace: true, state: null },
    );
  });

  it('keeps the inbox route when selecting a draft', () => {
    window.history.pushState(null, '', `/inbox/${THREAD_A}`);

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(
        getDefaultStore().get(newInboxThreadIdState.atom),
      );
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChatInbox,
      { threadId: INBOX_NEW_THREAD_PATH_SEGMENT },
      undefined,
      { replace: true, state: null },
    );
  });

  it('keeps the inbox route after the first message creates a thread', () => {
    window.history.pushState(
      { usr: { returnLocation: '/objects/people' } },
      '',
      `/inbox/${INBOX_NEW_THREAD_PATH_SEGMENT}`,
    );

    const { result } = renderHook(() =>
      useProjectInboxThreadToUrl({ shouldPreserveClosedInbox: true }),
    );

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChatInbox,
      { threadId: THREAD_A },
      undefined,
      { replace: true, state: { returnLocation: '/objects/people' } },
    );
  });

  it('should carry the history entry state forward', () => {
    window.history.pushState(
      { usr: { returnLocation: '/objects/people' } },
      '',
      '/chat',
    );

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
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

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    window.history.pushState(
      { usr: { returnLocation: '/objects/companies' } },
      '',
      '/chat',
    );

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
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

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).not.toHaveBeenCalled();
  });

  it('preserves the closed inbox when an automatic projection finishes after closing', () => {
    window.history.pushState(null, '', `/inbox/${THREAD_A}`);

    const { result } = renderHook(() =>
      useProjectInboxThreadToUrl({ shouldPreserveClosedInbox: true }),
    );

    window.history.pushState(null, '', '/inbox');

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).not.toHaveBeenCalled();
  });

  it('opens an explicitly selected chat from the closed inbox in a new history entry', () => {
    window.history.pushState(null, '', '/inbox');

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(THREAD_A);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChatInbox,
      { threadId: THREAD_A },
      undefined,
      { replace: false, state: null },
    );
  });

  it('opens a new chat from the closed inbox in a new history entry', () => {
    window.history.pushState(null, '', '/inbox');

    const { result } = renderHook(() => useProjectInboxThreadToUrl());

    act(() => {
      result.current.projectInboxThreadToUrl(
        getDefaultStore().get(newInboxThreadIdState.atom),
      );
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChatInbox,
      { threadId: INBOX_NEW_THREAD_PATH_SEGMENT },
      undefined,
      { replace: false, state: null },
    );
  });
});
