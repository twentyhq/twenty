import { renderHook } from '@testing-library/react';

import { useAiChatUnreadDividerMessageId } from '@/ai/hooks/useAiChatUnreadDividerMessageId';

const CURRENT_USER_WORKSPACE_ID = 'user-workspace-me';
const OTHER_USER_WORKSPACE_ID = 'user-workspace-lucas';

let agentChatMessages: unknown[] = [];
let dividerCursor: { hasCaptured: boolean; lastReadAt: string | null } = {
  hasCaptured: true,
  lastReadAt: null,
};

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: { key: string }) =>
    state.key === 'currentWorkspaceMemberState'
      ? { userWorkspaceId: CURRENT_USER_WORKSPACE_ID }
      : 'thread-1',
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({
    useAtomComponentFamilyStateValue: (state: { key: string }) =>
      state.key === 'agentChatMessagesComponentFamilyState'
        ? agentChatMessages
        : dividerCursor,
  }),
);

const message = (
  id: string,
  createdAt: string,
  authorUserWorkspaceId: string | null,
) => ({
  id,
  role: authorUserWorkspaceId === null ? 'assistant' : 'user',
  metadata: { authorUserWorkspaceId, createdAt },
});

describe('useAiChatUnreadDividerMessageId', () => {
  beforeEach(() => {
    agentChatMessages = [
      message(
        'message-1',
        '2026-09-19T10:00:00.000Z',
        CURRENT_USER_WORKSPACE_ID,
      ),
      message('message-2', '2026-09-19T10:01:00.000Z', null),
      message('message-3', '2026-09-19T10:02:00.000Z', OTHER_USER_WORKSPACE_ID),
      message('message-4', '2026-09-19T10:03:00.000Z', null),
    ];
    dividerCursor = { hasCaptured: true, lastReadAt: null };
  });

  it('puts the line above the first message that arrived after the reader left', () => {
    dividerCursor = {
      hasCaptured: true,
      lastReadAt: '2026-09-19T10:01:30.000Z',
    };

    expect(
      renderHook(() => useAiChatUnreadDividerMessageId()).result.current,
    ).toBe('message-3');
  });

  it('draws no line for a reader who is caught up', () => {
    dividerCursor = {
      hasCaptured: true,
      lastReadAt: '2026-09-19T10:30:00.000Z',
    };

    expect(
      renderHook(() => useAiChatUnreadDividerMessageId()).result.current,
    ).toBeNull();
  });

  it('skips over the reader own messages', () => {
    agentChatMessages = [
      message('message-1', '2026-09-19T10:00:00.000Z', null),
      message(
        'message-2',
        '2026-09-19T10:01:00.000Z',
        CURRENT_USER_WORKSPACE_ID,
      ),
      message('message-3', '2026-09-19T10:02:00.000Z', null),
    ];
    dividerCursor = {
      hasCaptured: true,
      lastReadAt: '2026-09-19T10:00:30.000Z',
    };

    expect(
      renderHook(() => useAiChatUnreadDividerMessageId()).result.current,
    ).toBe('message-3');
  });

  it('waits until the cursor has been captured', () => {
    dividerCursor = { hasCaptured: false, lastReadAt: null };

    expect(
      renderHook(() => useAiChatUnreadDividerMessageId()).result.current,
    ).toBeNull();
  });

  it('leaves the top of a thread alone, where everything below is new anyway', () => {
    agentChatMessages = [
      message('message-1', '2026-09-19T10:00:00.000Z', OTHER_USER_WORKSPACE_ID),
      message('message-2', '2026-09-19T10:01:00.000Z', null),
    ];
    dividerCursor = { hasCaptured: true, lastReadAt: null };

    expect(
      renderHook(() => useAiChatUnreadDividerMessageId()).result.current,
    ).toBeNull();
  });
});
