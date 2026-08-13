import { CoreApiClient } from 'twenty-client-sdk/core';

import { removeRecallBotsForRemovedCallRecording } from 'src/logic-functions/flows/remove-recall-bots-for-removed-call-recording.util';
import { type CallRecordingRemovalEvent } from 'src/logic-functions/types/call-recording-removal-event.type';

const CALL_RECORDING_REMOVAL_EVENT_NAMES = new Set([
  'callRecording.deleted',
  'callRecording.destroyed',
]);

export const removeRecallBotOnCallRecordingRemovalHandler = async (
  event: CallRecordingRemovalEvent,
) => {
  if (!CALL_RECORDING_REMOVAL_EVENT_NAMES.has(event.name)) {
    return { skipped: true, reason: 'not a call recording removal' };
  }

  return removeRecallBotsForRemovedCallRecording({
    client: new CoreApiClient(),
    callRecordingId: event.recordId,
    status: event.properties.before.status,
    externalBotId: event.properties.before.externalBotId,
    botScheduleAttemptedAt: event.properties.before.botScheduleAttemptedAt,
    botScheduleIdempotencyKey:
      event.properties.before.botScheduleIdempotencyKey,
  });
};
