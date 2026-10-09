import { enqueueJobs } from 'twenty-sdk/logic-function';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  MEETING_HORIZON_PERIOD_MS,
  MEETING_JOB_RETRY_LIMIT,
  MEETING_SCHEDULE_HORIZON_MS,
  MEETING_SLOT_JOB_DELAY_BUFFER_MS,
  MEETING_SLOT_MS,
} from 'src/constants/meeting-schedule';
import {
  MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { collectPersonMeetingParticipants } from 'src/utils/collect-person-meeting-participants';
import { executeWithRetry } from 'src/utils/execute-with-retry';

export type MeetingSlotPayload = { slotStart: string; slotEnd: string };

const enqueueDelayedJob = async ({
  logicFunctionUniversalIdentifier,
  jobId,
  payload,
  delayMs,
}: {
  logicFunctionUniversalIdentifier: string;
  jobId: string;
  payload: Record<string, unknown>;
  delayMs: number;
}): Promise<void> => {
  await executeWithRetry(() =>
    enqueueJobs({
      logicFunctionUniversalIdentifier,
      jobs: [{ payload, jobId }],
      delayMs,
      retryLimit: MEETING_JOB_RETRY_LIMIT,
    }),
  );
};

export const scheduleMeetings = async (
  meetingStartsAts: string[],
  now = Date.now(),
): Promise<void> => {
  const horizonEnd = now + MEETING_SCHEDULE_HORIZON_MS;
  const slotStartsMs = new Set<number>();
  let hasMeetingBeyondHorizon = false;

  for (const meetingStartsAt of meetingStartsAts) {
    const startsAtMs = Date.parse(meetingStartsAt);

    if (Number.isNaN(startsAtMs)) {
      continue;
    }

    if (startsAtMs > horizonEnd) {
      hasMeetingBeyondHorizon = true;
      continue;
    }

    const slotStartMs =
      Math.floor(startsAtMs / MEETING_SLOT_MS) * MEETING_SLOT_MS;

    if (slotStartMs + MEETING_SLOT_MS > now) {
      slotStartsMs.add(slotStartMs);
    }
  }

  for (const slotStartMs of [...slotStartsMs].sort()) {
    const slotEndMs = slotStartMs + MEETING_SLOT_MS;
    const payload: MeetingSlotPayload = {
      slotStart: new Date(slotStartMs).toISOString(),
      slotEnd: new Date(slotEndMs).toISOString(),
    };

    await enqueueDelayedJob({
      logicFunctionUniversalIdentifier:
        MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobId: `meeting-slot-${slotStartMs}`,
      payload,
      delayMs: slotEndMs - now + MEETING_SLOT_JOB_DELAY_BUFFER_MS,
    });
  }

  if (hasMeetingBeyondHorizon) {
    const nextPeriodStartMs =
      (Math.floor(now / MEETING_HORIZON_PERIOD_MS) + 1) *
      MEETING_HORIZON_PERIOD_MS;

    await enqueueDelayedJob({
      logicFunctionUniversalIdentifier:
        MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobId: `meeting-horizon-${nextPeriodStartMs}`,
      payload: {},
      delayMs: nextPeriodStartMs - now,
    });
  }
};

export const scheduleUpcomingPersonMeetings = async (
  client: CoreApiClient,
): Promise<void> => {
  const now = Date.now();
  const participants = await collectPersonMeetingParticipants(client, {
    from: new Date(now),
    shouldStop: ({ startsAt }) =>
      Date.parse(startsAt) > now + MEETING_SCHEDULE_HORIZON_MS,
  });

  await scheduleMeetings(
    participants.map(({ startsAt }) => startsAt),
    now,
  );
};
