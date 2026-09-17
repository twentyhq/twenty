import { act, renderHook } from '@testing-library/react';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

const CHANNEL_ID = '5e8c8a1c-6d17-4d75-8d47-3a6e1a2d0b11';
const THREAD_ID = '20202020-0000-4000-8000-000000000001';

describe('useProjectAiChatThreadToUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('names the selected thread in the channel page URL', () => {
    window.history.pushState({}, '', `/chat/channels/${CHANNEL_ID}`);

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_ID);
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/channels/${CHANNEL_ID}/${THREAD_ID}`,
      expect.objectContaining({ replace: true }),
    );
  });

  it('drops the thread from the channel page URL for a new chat', () => {
    window.history.pushState(
      {},
      '',
      `/chat/channels/${CHANNEL_ID}/${THREAD_ID}`,
    );

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    act(() => {
      result.current.projectAiChatThreadToUrl('new-thread-draft');
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/channels/${CHANNEL_ID}`,
      expect.objectContaining({ replace: true }),
    );
  });

  it('names the selected thread in the chat page URL', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_ID);
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `/chat/${THREAD_ID}`,
      expect.objectContaining({ replace: true }),
    );
  });

  it('leaves the URL alone outside the chat area', () => {
    window.history.pushState({}, '', '/objects/people');

    const { result } = renderHook(() => useProjectAiChatThreadToUrl());

    act(() => {
      result.current.projectAiChatThreadToUrl(THREAD_ID);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
