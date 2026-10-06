import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';

// Follow-ups of a recording armed for the same attempt and due in the same
// window share a job id, so every writer can arm one without the queue running
// duplicates. A re-arm is the next attempt, so it never collides with the
// running job that armed it.
const FOLLOW_UP_DEDUPLICATION_WINDOW_MS = 5 * MILLISECONDS_PER_MINUTE;

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
