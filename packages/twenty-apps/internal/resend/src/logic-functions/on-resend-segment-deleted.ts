import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
} from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { getResendClient } from 'src/utils/get-resend-client';

type ResendSegmentRecord = {
  id: string;
  resendId?: string;
};

type SegmentDeleteEvent = DatabaseEventPayload<
  ObjectRecordDeleteEvent<ResendSegmentRecord>
>;

const handler = async (
  event: SegmentDeleteEvent,
): Promise<object | undefined> => {
  const resendId = event.properties.before?.resendId;

  if (!isDefined(resendId) || resendId === '') {
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
  universalIdentifier: 'd5e5b6e1-e0d9-45f0-b3d9-6b96417e4ed0',
  name: 'on-resend-segment-deleted',
  description:
    'Removes a segment from Resend when a resendSegment record is deleted in Twenty',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'resendSegment.deleted',
  },
});
