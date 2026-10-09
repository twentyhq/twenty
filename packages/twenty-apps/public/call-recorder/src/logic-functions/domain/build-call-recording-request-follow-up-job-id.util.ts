import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';

const FOLLOW_UP_DEDUPLICATION_WINDOW_MS = 5 * MILLISECONDS_PER_MINUTE;

// Include the attempt so a running job cannot deduplicate its own successor.
export const buildCallRecordingRequestFollowUpJobId = ({
  callRecordingId,
  attempt,
  dueAt,
}: {
  callRecordingId: string;
  attempt: number;
  dueAt: Date;
}): string => {
  const dueWindow = Math.floor(
    dueAt.getTime() / FOLLOW_UP_DEDUPLICATION_WINDOW_MS,
  );

  return `call-recorder-${callRecordingId}-follow-up-${attempt}-${dueWindow}`;
};
