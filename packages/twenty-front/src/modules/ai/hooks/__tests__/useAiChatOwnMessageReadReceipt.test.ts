import { renderHook } from '@testing-library/react';

import { useAiChatOwnMessageReadReceipt } from '@/ai/hooks/useAiChatOwnMessageReadReceipt';

const CURRENT_USER_WORKSPACE_ID = 'user-workspace-me';
const OTHER_USER_WORKSPACE_ID = 'user-workspace-lucas';

const MESSAGE_SENT_AT = '2026-09-19T10:00:00.000Z';
const BEFORE_MESSAGE = '2026-09-19T09:00:00.000Z';
const AFTER_MESSAGE = '2026-09-19T10:05:00.000Z';

let isSharedThread = true;
let messages: unknown[] = [];
let reads: unknown[] = [];

const workspaceMembers = [
  {
    id: 'workspace-member-me',
    userWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    name: { firstName: 'Felix', lastName: 'Malfait' },
  },
  {
    id: 'workspace-member-lucas',
    userWorkspaceId: OTHER_USER_WORKSPACE_ID,
    name: { firstName: 'Lucas', lastName: 'Bernard' },
  },
  {
    id: 'workspace-member-marie',
    userWorkspaceId: 'user-workspace-marie',
    name: { firstName: 'Marie', lastName: 'Dupont' },
  },
];

jest.mock('@/ai/hooks/useChatThreadParticipants', () => ({
  useChatThreadParticipants: () => ({ isSharedThread }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: { key: string }) => {
    switch (state.key) {
      case 'agentChatDisplayedThreadState':
        return 'thread-1';
      case 'currentWorkspaceMemberState':
        return { userWorkspaceId: CURRENT_USER_WORKSPACE_ID };
      case 'currentWorkspaceMembersState':
        return workspaceMembers;
      default:
        return null;
    }
  },
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({
    useAtomComponentFamilyStateValue: (state: { key: string }) =>
      state.key === 'agentChatMessagesComponentFamilyState' ? messages : reads,
  }),
);

const ownMessage = (id: string) => ({
  id,
  role: 'user',
  metadata: {
    authorUserWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    createdAt: MESSAGE_SENT_AT,
  },
});

describe('useAiChatOwnMessageReadReceipt', () => {
  beforeEach(() => {
    isSharedThread = true;
    messages = [ownMessage('message-1')];
    reads = [];
  });

  it('marks your last message as sent when nobody has opened the thread since', () => {
    reads = [
      {
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        lastReadAt: BEFORE_MESSAGE,
      },
    ];

    const { result } = renderHook(() =>
      useAiChatOwnMessageReadReceipt('message-1'),
    );

    expect(result.current.shouldDisplayReceipt).toBe(true);
    expect(result.current.readers).toEqual([]);
  });

  it('names the participants who have read past it', () => {
    reads = [
      { userWorkspaceId: OTHER_USER_WORKSPACE_ID, lastReadAt: AFTER_MESSAGE },
    ];

    const { result } = renderHook(() =>
      useAiChatOwnMessageReadReceipt('message-1'),
    );

    expect(result.current.readers).toEqual([workspaceMembers[1]]);
  });

  it('never counts your own cursor as a reader', () => {
    reads = [
      {
        userWorkspaceId: CURRENT_USER_WORKSPACE_ID,
        lastReadAt: AFTER_MESSAGE,
      },
    ];

    const { result } = renderHook(() =>
      useAiChatOwnMessageReadReceipt('message-1'),
    );

    expect(result.current.readers).toEqual([]);
  });

  it('carries the receipt on the last of your messages only', () => {
    messages = [ownMessage('message-1'), ownMessage('message-2')];

    expect(
      renderHook(() => useAiChatOwnMessageReadReceipt('message-1')).result
        .current.shouldDisplayReceipt,
    ).toBe(false);
    expect(
      renderHook(() => useAiChatOwnMessageReadReceipt('message-2')).result
        .current.shouldDisplayReceipt,
    ).toBe(true);
  });

  it('stays out of a thread nobody else can read', () => {
    isSharedThread = false;

    expect(
      renderHook(() => useAiChatOwnMessageReadReceipt('message-1')).result
        .current.shouldDisplayReceipt,
    ).toBe(false);
  });

  it('ignores messages somebody else wrote', () => {
    messages = [
      {
        id: 'message-1',
        role: 'user',
        metadata: {
          authorUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
          createdAt: MESSAGE_SENT_AT,
        },
      },
    ];

    expect(
      renderHook(() => useAiChatOwnMessageReadReceipt('message-1')).result
        .current.shouldDisplayReceipt,
    ).toBe(false);
  });
});
