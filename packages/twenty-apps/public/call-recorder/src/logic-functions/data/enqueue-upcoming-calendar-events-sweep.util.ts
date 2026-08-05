import { enqueueJob } from 'twenty-sdk/logic-function';

import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';

// Runs the cron sweep on demand: it discovers upcoming calendar events and
// fans reconciliation out into batch jobs.
export const enqueueUpcomingCalendarEventsSweep = async (): Promise<void> => {
  await enqueueJob({
    logicFunctionUniversalIdentifier:
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
  });
};
