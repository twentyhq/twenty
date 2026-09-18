import { renderHook } from '@testing-library/react';

import { useIsAiChatThreadUnread } from '@/ai/hooks/useIsAiChatThreadUnread';

let unreadThreadIds: string[] = [];

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => unreadThreadIds,
}));

describe('useIsAiChatThreadUnread', () => {
  it('calls a thread unread when it is in the set', () => {
    unreadThreadIds = ['thread-1', 'thread-2'];

    expect(
      renderHook(() => useIsAiChatThreadUnread('thread-1')).result.current,
    ).toBe(true);
  });

  it('leaves a thread alone when it is not', () => {
    unreadThreadIds = ['thread-2'];

    expect(
      renderHook(() => useIsAiChatThreadUnread('thread-1')).result.current,
    ).toBe(false);
  });

  it('treats an empty set as everything read', () => {
    unreadThreadIds = [];

    expect(
      renderHook(() => useIsAiChatThreadUnread('thread-1')).result.current,
    ).toBe(false);
  });
});
