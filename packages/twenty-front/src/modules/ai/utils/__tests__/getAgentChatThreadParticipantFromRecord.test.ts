import { getInboxThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';

const RESOLVED_PARTICIPANT = {
  __typename: 'AgentChatThreadParticipant',
  id: 'participant',
  threadId: 'thread',
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: '2026-10-01T10:00:00.000Z',
  mentionsResolvedAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:01:00.000Z',
};

describe('getInboxThreadParticipantFromRecord', () => {
  it('keeps the inbox fields of a record event, with its resolved mention', () => {
    expect(
      getInboxThreadParticipantFromRecord({
        ...RESOLVED_PARTICIPANT,
        workspaceMemberId: 'workspace-member',
      }),
    ).toEqual(RESOLVED_PARTICIPANT);
  });

  it('reads a record without a resolved mention as unresolved', () => {
    expect(
      getInboxThreadParticipantFromRecord({
        id: 'participant',
        threadId: 'thread',
        lastMentionedAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:01:00.000Z',
      }),
    ).toMatchObject({
      lastMentionedAt: '2026-10-01T10:00:00.000Z',
      mentionsResolvedAt: null,
    });
  });
});
