import { enqueueJobs } from 'twenty-sdk/logic-function';

import {
  MEETING_JOB_RETRY_LIMIT,
  MEETING_SCHEDULE_HORIZON_MS,
  MEETING_SLOT_JOB_DELAY_BUFFER_MS,
  MEETING_SLOT_MS,
} from 'src/constants/meeting-schedule';
import { MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';

export type MeetingSlotPayload = { slotStart: string; slotEnd: string };

// One delayed job per time slot rather than per meeting: the job id is derived
// from the slot, so every meeting starting in it is handled by the same job.
export const scheduleMeetingSlotJobs = async (
  meetingStartsAts: string[],
): Promise<void> => {
  const now = Date.now();
  const slotStartsMs = new Set<number>();

  for (const meetingStartsAt of meetingStartsAts) {
    const startsAtMs = Date.parse(meetingStartsAt);

    if (
      Number.isNaN(startsAtMs) ||
      startsAtMs <= now ||
      startsAtMs > now + MEETING_SCHEDULE_HORIZON_MS
    ) {
      continue;
    }

    slotStartsMs.add(Math.floor(startsAtMs / MEETING_SLOT_MS) * MEETING_SLOT_MS);
  }

  for (const slotStartMs of [...slotStartsMs].sort()) {
    const slotEndMs = slotStartMs + MEETING_SLOT_MS;
    const payload: MeetingSlotPayload = {
      slotStart: new Date(slotStartMs).toISOString(),
      slotEnd: new Date(slotEndMs).toISOString(),
    };

    await executeWithRetry(() =>
      enqueueJobs({
        logicFunctionUniversalIdentifier:
          MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: [{ payload, jobId: `meeting-slot-${slotStartMs}` }],
        delayMs: slotEndMs - now + MEETING_SLOT_JOB_DELAY_BUFFER_MS,
        retryLimit: MEETING_JOB_RETRY_LIMIT,
      }),
    );
  }
};
