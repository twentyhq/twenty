import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

import { ON_RESEND_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import type { ResendSegmentRecord } from '@modules/resend/shared/types/resend-segment-record';
import { findOrCreateResendSegment } from '@modules/resend/sync/utils/find-or-create-resend-segment';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';

type SegmentCreateEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentCreateEvent,
): Promise<object | undefined> => {
  const { after } = event.properties;

  if (isNonEmptyString(after.resendId)) {
    return {
      skipped: true,
      reason: 'record already has resendId (inbound sync)',
    };
  }

  const name = after.name;

  if (!isNonEmptyString(name)) {
    return { skipped: true, reason: 'no name on record' };
  }

  const resendClient = getResendClient();
  const client = new CoreApiClient();

  const resendId = await findOrCreateResendSegment(resendClient, client, name);

  await client.mutation({
    updateResendSegment: {
      __args: {
        id: event.recordId,
        data: {
          resendId,
          lastSyncedFromResend: new Date().toISOString(),
        },
      },
      id: true,
    },
  });

  return { synced: true, resendId, twentyId: event.recordId };
};

export default defineLogicFunction({
  universalIdentifier:
    ON_RESEND_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-segment-created',
  description:
    'Creates a segment in Resend when a new resendSegment record is created in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.created',
  },
});
