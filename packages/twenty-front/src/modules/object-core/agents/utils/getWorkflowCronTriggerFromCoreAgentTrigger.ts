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

  const days = pattern.match(DAYS_PATTERN);

  if (isDefined(days)) {
    return {
      type: 'CRON',
      settings: {
        type: 'DAYS',
        schedule: {
          minute: Number(days[1]),
          hour: Number(days[2]),
          day: Number(days[3]),
        },
        outputSchema: {},
      },
    };
  }

  const hours = pattern.match(HOURS_PATTERN);

  if (isDefined(hours)) {
    return {
      type: 'CRON',
      settings: {
        type: 'HOURS',
        schedule: { minute: Number(hours[1]), hour: Number(hours[2]) },
        outputSchema: {},
      },
    };
  }

  const minutes = pattern.match(MINUTES_PATTERN);

  if (isDefined(minutes)) {
    return {
      type: 'CRON',
      settings: {
        type: 'MINUTES',
        schedule: { minute: Number(minutes[1]) },
        outputSchema: {},
      },
    };
  }

  return {
    type: 'CRON',
    settings: { type: 'CUSTOM', pattern, outputSchema: {} },
  };
};
