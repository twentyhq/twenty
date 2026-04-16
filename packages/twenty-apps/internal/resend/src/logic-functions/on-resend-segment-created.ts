import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import { getResendClient } from 'src/utils/get-resend-client';

type ResendSegmentRecord = {
  id: string;
  resendId?: string;
  name?: string;
};

type SegmentCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentCreateEvent,
): Promise<object | undefined> => {
  const { after } = event.properties;

  if (isDefined(after.resendId) && after.resendId !== '') {
    return { skipped: true, reason: 'record already has resendId (inbound sync)' };
  }

  const name = after.name;

  if (!isDefined(name) || name === '') {
    return { skipped: true, reason: 'no name on record' };
  }

  const resend = getResendClient();

  const { data, error } = await resend.segments.create({ name });

  if (isDefined(error) || !isDefined(data)) {
    throw new Error(
      `Failed to create Resend segment: ${JSON.stringify(error)}`,
    );
  }

  const client = new CoreApiClient();

  await client.mutation({
    updateResendSegment: {
      __args: {
        id: event.recordId,
        data: {
          resendId: data.id,
          lastSyncedFromResend: new Date().toISOString(),
        },
      },
      id: true,
    },
  });

  return { synced: true, resendId: data.id, twentyId: event.recordId };
};

export default defineLogicFunction({
  universalIdentifier: 'ac5b424a-f51d-46c8-a95a-42589fb81676',
  name: 'on-resend-segment-created',
  description:
    'Creates a segment in Resend when a new resendSegment record is created in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.created',
  },
});
