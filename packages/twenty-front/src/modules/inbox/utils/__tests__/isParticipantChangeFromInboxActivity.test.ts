import { isParticipantChangeFromInboxActivity } from '@/inbox/utils/isParticipantChangeFromInboxActivity';

const LAST_ACTIVITY_AT = '2026-11-16T17:31:47.000Z';

describe('isParticipantChangeFromInboxActivity', () => {
  it('should match a participant change written right after the message', () => {
    expect(
      isParticipantChangeFromInboxActivity({
        participantUpdatedAt: '2026-11-16T17:31:47.300Z',
        lastActivityAt: LAST_ACTIVITY_AT,
      }),
    ).toBe(true);
  });

  it('should match a participant change written just before the message', () => {
    expect(
      isParticipantChangeFromInboxActivity({
        participantUpdatedAt: '2026-11-16T17:31:46.800Z',
        lastActivityAt: LAST_ACTIVITY_AT,
      }),
    ).toBe(true);
  });

  it('should not match a mention that comes seconds after an earlier message', () => {
    expect(
      isParticipantChangeFromInboxActivity({
        participantUpdatedAt: '2026-11-16T17:31:51.000Z',
        lastActivityAt: LAST_ACTIVITY_AT,
      }),
    ).toBe(false);
  });
});
