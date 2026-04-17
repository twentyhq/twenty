import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { ON_RESEND_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import type { ResendSegmentRecord } from 'src/modules/resend/types/resend-segment-record';
import { getResendClient } from 'src/modules/resend/utils/get-resend-client';

type SegmentCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentCreateEvent,
): Promise<object | undefined> => {
  const { after } = event.properties;

  if (isNonEmptyString(after.resendId)) {
    return { skipped: true, reason: 'record already has resendId (inbound sync)' };
  }

  const name = after.name;

  if (!isNonEmptyString(name)) {
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
  universalIdentifier: ON_RESEND_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-segment-created',
  description:
    'Creates a segment in Resend when a new resendSegment record is created in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.created',
  },
});
