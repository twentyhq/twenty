import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonForInteraction } from 'src/utils/update-person-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const AT = '2026-06-10T09:00:00.000Z';
const OLDER = '2026-06-01T00:00:00.000Z';
const NEWER = '2026-07-01T00:00:00.000Z';

const buildClient = (person: unknown) => {
  const queryMock = vi.fn().mockResolvedValue({ person });
  const mutationMock = vi
    .fn()
    .mockResolvedValue({ updatePerson: { id: PERSON_ID } });
  const client = {
    query: queryMock,
    mutation: mutationMock,
  } as unknown as CoreApiClient;

  return { client, mutationMock };
};

const mutationData = (mutationMock: ReturnType<typeof vi.fn>) =>
  mutationMock.mock.calls[0][0].updatePerson.__args.data;

describe('updatePersonForInteraction', () => {
  it('sets interaction, owner, item, contacted and lastEmail for a new outbound email', async () => {
    const { client, mutationMock } = buildClient(null);

    await updatePersonForInteraction(client, {
      personId: PERSON_ID,
      occurredAt: AT,
      kind: 'email',
      itemId: MESSAGE_ID,
      workspaceMemberId: MEMBER_ID,
      direction: 'outbound',
    });

    expect(mutationData(mutationMock)).toEqual({
      lastInteractionAt: AT,
      lastOwnerId: MEMBER_ID,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
      lastContactedAt: AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('sets engagement (not contacted) for a new inbound email', async () => {
    const { client, mutationMock } = buildClient(null);

    await updatePersonForInteraction(client, {
      personId: PERSON_ID,
      occurredAt: AT,
      kind: 'email',
      itemId: MESSAGE_ID,
      workspaceMemberId: MEMBER_ID,
      direction: 'inbound',
    });

    expect(mutationData(mutationMock)).toEqual({
      lastInteractionAt: AT,
      lastOwnerId: MEMBER_ID,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
      lastEngagementAt: AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('counts a meeting as both contacted and engagement', async () => {
    const { client, mutationMock } = buildClient(null);

    await updatePersonForInteraction(client, {
      personId: PERSON_ID,
      occurredAt: AT,
      kind: 'meeting',
      itemId: CALENDAR_EVENT_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(mutationData(mutationMock)).toEqual({
      lastInteractionAt: AT,
      lastOwnerId: MEMBER_ID,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      lastContactItemMessageId: null,
      lastContactedAt: AT,
      lastEngagementAt: AT,
      lastMeetingId: CALENDAR_EVENT_ID,
    });
  });

  it('advances only the fields that are newer than the stored values', async () => {
    const { client, mutationMock } = buildClient({
      lastInteractionAt: NEWER,
      lastContactedAt: NEWER,
      lastEngagementAt: null,
      lastEmail: { receivedAt: OLDER },
      lastMeeting: null,
    });

    await updatePersonForInteraction(client, {
      personId: PERSON_ID,
      occurredAt: AT,
      kind: 'email',
      itemId: MESSAGE_ID,
      workspaceMemberId: MEMBER_ID,
      direction: 'inbound',
    });

    expect(mutationData(mutationMock)).toEqual({
      lastEngagementAt: AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('does not mutate when nothing is newer', async () => {
    const { client, mutationMock } = buildClient({
      lastInteractionAt: NEWER,
      lastContactedAt: NEWER,
      lastEngagementAt: NEWER,
      lastEmail: { receivedAt: NEWER },
      lastMeeting: { startsAt: NEWER },
    });

    await updatePersonForInteraction(client, {
      personId: PERSON_ID,
      occurredAt: AT,
      kind: 'meeting',
      itemId: CALENDAR_EVENT_ID,
      workspaceMemberId: MEMBER_ID,
    });

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
