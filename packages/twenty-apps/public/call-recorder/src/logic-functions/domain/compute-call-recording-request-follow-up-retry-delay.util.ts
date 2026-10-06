import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDING_REQUEST_FOLLOW_UP_RETRY_DELAYS_MS } from 'src/logic-functions/constants/call-recording-request-follow-up-retry-delays-ms';

export const computeCallRecordingRequestFollowUpRetryDelayMs = ({
  attempt,
  meetingStartsAt,
  now,
}: {
  attempt: number;
  meetingStartsAt: string | undefined;
  now: Date;
}): number => {
  const scheduledDelayMs =
    CALL_RECORDING_REQUEST_FOLLOW_UP_RETRY_DELAYS_MS[
      Math.min(
        attempt,
        CALL_RECORDING_REQUEST_FOLLOW_UP_RETRY_DELAYS_MS.length - 1,
      )
    ];
  const timeUntilMeetingStartMs = isUndefined(meetingStartsAt)
    ? Number.NaN
    : new Date(meetingStartsAt).getTime() - now.getTime();

  // A retry that would land after the meeting started comes at the start
  // instead, while a bot can still join on time.
  if (timeUntilMeetingStartMs > 0) {
    return Math.min(scheduledDelayMs, timeUntilMeetingStartMs);
  }

  return scheduledDelayMs;
};
