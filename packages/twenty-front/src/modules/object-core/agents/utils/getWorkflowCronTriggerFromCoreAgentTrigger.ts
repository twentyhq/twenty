import { type AgentCronTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';

const DAYS_PATTERN = /^(\d+) (\d+) \*\/(\d+) \* \*$/;
const HOURS_PATTERN = /^(\d+) \*\/(\d+) \* \* \*$/;
const MINUTES_PATTERN = /^\*\/(\d+) \* \* \* \*$/;

export const getWorkflowCronTriggerFromCoreAgentTrigger = (
  trigger: AgentCronTrigger,
): WorkflowCronTrigger => {
  const pattern = trigger.settings.pattern.trim();

  const daysMatch = pattern.match(DAYS_PATTERN);

  if (isDefined(daysMatch)) {
    return {
      type: 'CRON',
      settings: {
        type: 'DAYS',
        schedule: {
          minute: Number(daysMatch[1]),
          hour: Number(daysMatch[2]),
          day: Number(daysMatch[3]),
        },
        outputSchema: {},
      },
    };
  }

  const hoursMatch = pattern.match(HOURS_PATTERN);

  if (isDefined(hoursMatch)) {
    return {
      type: 'CRON',
      settings: {
        type: 'HOURS',
        schedule: {
          minute: Number(hoursMatch[1]),
          hour: Number(hoursMatch[2]),
        },
        outputSchema: {},
      },
    };
  }

  const minutesMatch = pattern.match(MINUTES_PATTERN);

  if (isDefined(minutesMatch)) {
    return {
      type: 'CRON',
      settings: {
        type: 'MINUTES',
        schedule: { minute: Number(minutesMatch[1]) },
        outputSchema: {},
      },
    };
  }

  return {
    type: 'CRON',
    settings: { type: 'CUSTOM', pattern, outputSchema: {} },
  };
};
