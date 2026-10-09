import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  ENQUEUE_UPCOMING_CALENDAR_EVENTS_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN } from 'src/logic-functions/constants/upcoming-calendar-events-sweep-cron-pattern';
import {
  enqueueWorkspaceDistributedJob,
  type EnqueueWorkspaceDistributedJobResult,
} from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';

export const enqueueUpcomingCalendarEventsSweepHandler = (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueWorkspaceDistributedJobResult> =>
  enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    stepLabel: 'upcoming calendar events sweep enqueueing',
  });

export default defineLogicFunction({
  universalIdentifier:
    ENQUEUE_UPCOMING_CALENDAR_EVENTS_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'enqueue-upcoming-calendar-events-sweep',
  description:
    'Enqueues the upcoming calendar events sweep at a stable workspace-specific delay to distribute Twenty API traffic.',
  timeoutSeconds: 30,
  handler: enqueueUpcomingCalendarEventsSweepHandler,
  cronTriggerSettings: {
    pattern: UPCOMING_CALENDAR_EVENTS_SWEEP_CRON_PATTERN,
  },
});
