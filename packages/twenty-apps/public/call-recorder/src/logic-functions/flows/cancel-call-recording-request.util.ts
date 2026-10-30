import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS } from 'src/logic-functions/constants/call-recording-request-follow-up-delay-ms';
import { CALL_RECORDING_REQUEST_FOLLOW_UP_SLOT_SLACK_MS } from 'src/logic-functions/constants/call-recording-request-follow-up-slot-slack-ms';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { computeDeferredRecallBotDeletionAt } from 'src/logic-functions/domain/compute-deferred-recall-bot-deletion-at.util';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { clearCanceledRecallBot } from 'src/logic-functions/data/clear-canceled-recall-bot.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export const cancelCallRecordingRequest = async ({
  client,
  callRecording,
  calendarEvent,
  isRecallBotDeletionDeferralEnabled,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  isRecallBotDeletionDeferralEnabled: () => Promise<boolean>;
  now: Date;
}): Promise<void> => {
  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
    },
  });

  if (isUndefined(callRecording.externalBotId)) {
    return;
  }

  // Defer only if the follow-up armed with this cancellation still arrives before the deletion time.
  const latestFollowUpArrival = new Date(
    now.getTime() +
      CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS +
      CALL_RECORDING_REQUEST_FOLLOW_UP_SLOT_SLACK_MS,
  );

  if (
    !isUndefined(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: callRecording.id,
        calendarEvent,
        now: latestFollowUpArrival,
      }),
    ) &&
    (await isRecallBotDeletionDeferralEnabled())
  ) {
    return;
  }

  const cancelResult = await cancelRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!cancelResult.ok) {
    console.warn(
      `[call-recorder] failed to cancel Recall bot for callRecording ${callRecording.id}, leaving it for the follow-up: ${cancelResult.errorMessage}`,
    );

    return;
  }

  await clearCanceledRecallBot(client, {
    callRecordingId: callRecording.id,
    externalBotId: callRecording.externalBotId,
  });
};
