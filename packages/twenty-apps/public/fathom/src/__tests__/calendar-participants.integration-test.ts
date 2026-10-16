import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';

import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

describe('Fathom calendar participants (integration)', () => {
  const adminClient = new CoreApiClient();
  let client: CoreApiClient;
  let applicationId: string;
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
    const created = await client.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            calendarEventId,
            title: 'Imported meeting',
            status: 'COMPLETED',
          },
        },
        id: true,
        applicationId: true,
      },
    });
    const stampedApplicationId = created.createCallRecording?.applicationId;
    if (!stampedApplicationId) {
      throw new Error('Application identity was not stamped');
    }
    applicationId = stampedApplicationId;
  });

  afterEach(async () => {
    await adminClient.mutation({
      destroyCalendarEventParticipants: {
        __args: { filter: { id: { eq: callRecordingId } } },
        id: true,
      },
    });
    await adminClient.mutation({
      destroyCallRecordings: {
        __args: { filter: { id: { eq: callRecordingId } } },
        id: true,
      },
    });
    await adminClient.mutation({
      destroyCalendarEvent: { __args: { id: calendarEventId }, id: true },
    });
  });

  const sync = () =>
    syncCallRecordingCalendarParticipant({
      client,
      applicationId,
      callRecordingId,
    });
  const findParticipants = async () => {
    const result = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: { calendarEventId: { eq: calendarEventId } },
          first: 10,
        },
        edges: { node: { id: true, applicationId: true, displayName: true } },
      },
    });
    return result.calendarEventParticipants?.edges ?? [];
  };

  it('creates one app participant for a matched import under concurrent delivery', async () => {
    await Promise.all([sync(), sync()]);
    await sync();
    expect(await findParticipants()).toEqual([
      { node: { id: callRecordingId, applicationId, displayName: 'Fathom' } },
    ]);
  });

  it('removes the participant after unlinking or deletion and recreates it after relinking', async () => {
    await sync();
    await client.mutation({
      updateCallRecording: {
        __args: { id: callRecordingId, data: { calendarEventId: null } },
        id: true,
      },
    });
    await sync();
    expect(await findParticipants()).toEqual([]);
    await client.mutation({
      updateCallRecording: {
        __args: { id: callRecordingId, data: { calendarEventId } },
        id: true,
      },
    });
    await sync();
    expect(await findParticipants()).toHaveLength(1);
    await adminClient.mutation({
      deleteCallRecording: { __args: { id: callRecordingId }, id: true },
    });
    await sync();
    expect(await findParticipants()).toEqual([]);
  });
});
