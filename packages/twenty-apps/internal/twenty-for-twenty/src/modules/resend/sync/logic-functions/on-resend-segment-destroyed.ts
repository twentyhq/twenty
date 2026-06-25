import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordDestroyEvent,
} from 'twenty-sdk/logic-function';
import { isDefined } from '@utils/is-defined';

import { ON_RESEND_SEGMENT_DESTROYED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import type { ResendSegmentRecord } from '@modules/resend/shared/types/resend-segment-record';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';

type SegmentDestroyEvent = DatabaseEventPayload<
  ObjectRecordDestroyEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentDestroyEvent,
): Promise<object | undefined> => {
  const resendId = event.properties.before?.resendId;

  if (!isNonEmptyString(resendId)) {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resendClient = getResendClient();

  const { error } = await resendClient.segments.remove(resendId);

  if (isDefined(error)) {
    const errorString = JSON.stringify(error);

    if (errorString.includes('not_found')) {
      return { skipped: true, reason: 'segment already deleted on Resend' };
    }

    throw new Error(
      `Failed to delete Resend segment ${resendId}: ${errorString}`,
    );
  }

  return { synced: true, resendId, action: 'destroyed' };
};

export default defineLogicFunction({
  universalIdentifier:
    ON_RESEND_SEGMENT_DESTROYED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-segment-destroyed',
  description:
    'Removes a segment from Resend when a resendSegment record is permanently destroyed in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.destroyed',
  },
});
