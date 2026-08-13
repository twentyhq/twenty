import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { removeRecallBotsForRemovedCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util';
import { resumePendingCallRecording } from 'src/logic-functions/flows/resume-pending-call-recording.util';
import { type CallRecordingRestoredEvent } from 'src/logic-functions/types/call-recording-restored-event.type';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export const scheduleRecallBotOnCallRecordingRestorationHandler = async (
  event: CallRecordingRestoredEvent,
) => {
  if (event.name !== 'callRecording.restored') {
    return { skipped: true, reason: 'not a call recording restoration' };
  }

  const restoredCallRecording = event.properties.after;
  const client = new CoreApiClient();

  if (
    !isUndefined(
      normalizeOptionalString(restoredCallRecording.externalBotId),
    ) ||
    !isUndefined(
      normalizeOptionalString(restoredCallRecording.botScheduleAttemptedAt),
    )
  ) {
    await removeRecallBotsForRemovedCallRecording({
      client,
      callRecordingId: event.recordId,
      status: restoredCallRecording.status,
      externalBotId: restoredCallRecording.externalBotId,
      botScheduleAttemptedAt: restoredCallRecording.botScheduleAttemptedAt,
      botScheduleIdempotencyKey:
        restoredCallRecording.botScheduleIdempotencyKey,
    });
  }

  return resumePendingCallRecording({
    client,
    callRecordingId: event.recordId,
    now: new Date(),
  });
};
