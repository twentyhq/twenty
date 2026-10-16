import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { upsertCallRecordingCalendarParticipant } from 'src/logic-functions/utils/upsert-call-recording-calendar-participant.util';

describe('Fathom calendar participants (integration)', () => {
  const adminClient = new CoreApiClient();
  let client: CoreApiClient;
  let calendarEventId: string;
  let callRecordingId: string;

  beforeAll(async () => {
    client = await createFathomApplicationCoreApiClient();
  });

  beforeEach(async () => {
    calendarEventId = randomUUID();
    callRecordingId = randomUUID();
    await adminClient.mutation({
      createCalendarEvent: {
        __args: {
          data: {
            id: calendarEventId,
            title: 'Recording participant integration test',
          },
        },
        id: true,
      },
    });
  });

  afterEach(async () => {
    await adminClient.mutation({
      destroyCalendarEventParticipants: {
        __args: { filter: { id: { eq: callRecordingId } } },
        id: true,
      },
    });
    await adminClient.mutation({
      destroyCalendarEvent: { __args: { id: calendarEventId }, id: true },
    });
  });

  it('adds one app participant to the matched calendar event across repeated imports', async () => {
    const upsertParticipant = () =>
      upsertCallRecordingCalendarParticipant({
        coreApiClient: client,
        callRecordingId,
        calendarEventId,
      });

    await upsertParticipant();
    await upsertParticipant();

    const result = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: { calendarEventId: { eq: calendarEventId } },
          first: 10,
        },
        edges: {
          node: { id: true, createdBy: { source: true }, displayName: true },
        },
      },
    });

    expect(result.calendarEventParticipants?.edges).toEqual([
      {
        node: {
          id: callRecordingId,
          createdBy: { source: 'APPLICATION' },
          displayName: 'Fathom',
        },
      },
    ]);
  });
});
