import { getAgentChatThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';

const RESOLVED_PARTICIPANT = {
  __typename: 'AgentChatThreadParticipant',
  id: 'participant',
  threadId: 'thread',
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: '2026-10-01T10:00:00.000Z',
  lastResolvedMentionAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:01:00.000Z',
};

describe('getAgentChatThreadParticipantFromRecord', () => {
  it('keeps the inbox fields of a record event, with its resolved mention', () => {
    expect(
      getAgentChatThreadParticipantFromRecord({
        ...RESOLVED_PARTICIPANT,
        workspaceMemberId: 'workspace-member',
      }),
    ).toEqual(RESOLVED_PARTICIPANT);
  });

  it('reads a record without a resolved mention as unresolved', () => {
    expect(
      getAgentChatThreadParticipantFromRecord({
        id: 'participant',
        threadId: 'thread',
        lastMentionedAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:01:00.000Z',
      }),
    ).toMatchObject({
      lastMentionedAt: '2026-10-01T10:00:00.000Z',
      lastResolvedMentionAt: null,
    });
  });
});
