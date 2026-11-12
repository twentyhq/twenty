import { getAgentChatMessageReaders } from '@/ai/utils/getAgentChatMessageReaders';

const CREATED_AT = '2026-10-01T10:04:00.000Z';

describe('getAgentChatMessageReaders', () => {
  it('splits recipients between those who read the message and those who did not', () => {
    expect(
      getAgentChatMessageReaders({
        createdAt: CREATED_AT,
        senderWorkspaceMemberId: 'sender',
        readPositions: [
          { workspaceMemberId: 'sender', lastReadAt: CREATED_AT },
          {
            workspaceMemberId: 'read-later',
            lastReadAt: '2026-10-01T10:05:00.000Z',
          },
          {
            workspaceMemberId: 'read-before',
            lastReadAt: '2026-10-01T10:03:00.000Z',
          },
          { workspaceMemberId: 'never-read', lastReadAt: null },
        ],
      }),
    ).toEqual({
      readerWorkspaceMemberIds: ['read-later'],
      pendingWorkspaceMemberIds: ['read-before', 'never-read'],
    });
  });
});
