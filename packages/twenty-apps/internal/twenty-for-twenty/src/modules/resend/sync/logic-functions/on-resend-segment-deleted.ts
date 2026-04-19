import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordDeleteEvent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { ON_RESEND_SEGMENT_DELETED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import type { ResendSegmentRecord } from 'src/modules/resend/shared/types/resend-segment-record';
import { getResendClient } from 'src/modules/resend/shared/utils/get-resend-client';

type SegmentDeleteEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentDeleteEvent,
): Promise<object | undefined> => {
  const resendId = event.properties.before?.resendId;

  if (!isNonEmptyString(resendId)) {
    return { skipped: true, reason: 'no resendId on record' };
  }

  const resend = getResendClient();

  const { error } = await resend.segments.remove(resendId);

  if (isDefined(error)) {
    const errorString = JSON.stringify(error);

    if (errorString.includes('not_found')) {
      return { skipped: true, reason: 'segment already deleted on Resend' };
    }

    throw new Error(
      `Failed to delete Resend segment ${resendId}: ${errorString}`,
    );
  }

  return { synced: true, resendId, action: 'deleted' };
};

export default defineLogicFunction({
  universalIdentifier: ON_RESEND_SEGMENT_DELETED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-resend-segment-deleted',
  description:
    'Removes a segment from Resend when a resendSegment record is deleted in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.deleted',
  },
});
