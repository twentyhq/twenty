import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { syncCallRecordingCalendarParticipant } from 'src/logic-functions/utils/sync-call-recording-calendar-participant.util';

describe('Fireflies calendar participants (integration)', () => {
  const adminClient = new CoreApiClient();
  let client: CoreApiClient;
  let applicationId: string;
  let calendarEventId: string;
  let callRecordingId: string;

  beforeAll(async () => {
    const metadataClient = new MetadataApiClient();
    const result = await metadataClient.query({
      findApplicationRegistrationByUniversalIdentifier: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        id: true,
        oAuthClientId: true,
      },
    });
    const registration =
      result.findApplicationRegistrationByUniversalIdentifier;
    if (!registration) {
      throw new Error('Application registration missing');
    }
    const rotation = await metadataClient.mutation({
      rotateApplicationRegistrationClientSecret: {
        __args: { id: registration.id },
        clientSecret: true,
      },
    });
    const response = await fetch(`${process.env.TWENTY_API_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: registration.oAuthClientId,
        client_secret:
          rotation.rotateApplicationRegistrationClientSecret.clientSecret,
      }),
    });
    const body = (await response.json()) as { access_token?: string };
    if (!response.ok || !body.access_token) {
      throw new Error('Application token exchange failed');
    }
    client = new CoreApiClient({
      headers: { Authorization: `Bearer ${body.access_token}` },
    });
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
      {
        node: { id: callRecordingId, applicationId, displayName: 'Fireflies' },
      },
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
