import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type CronTriggerInterval } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { assertUnreachable } from 'twenty-shared/utils';

const DEFAULT_CRON_PATTERN = '0 */1 * * *'; // Every hour

export const getCronTriggerDefaultSettings = (
  cronTriggerInterval: CronTriggerInterval,
): WorkflowCronTrigger['settings'] => {
  switch (cronTriggerInterval) {
    case 'DAYS':
      return {
        schedule: {
          day: 1,
          hour: 0,
          minute: 0,
        },
        type: cronTriggerInterval,
        outputSchema: {},
      };
    case 'HOURS':
      return {
        schedule: {
          hour: 1,
          minute: 0,
        },
        type: cronTriggerInterval,
        outputSchema: {},
      };
    case 'MINUTES':
      return {
        schedule: {
          minute: 1,
        },
        type: cronTriggerInterval,
        outputSchema: {},
      };
    case 'CUSTOM':
      return {
        pattern: DEFAULT_CRON_PATTERN,
        type: cronTriggerInterval,
        outputSchema: {},
      };
  }
  return assertUnreachable(
    cronTriggerInterval,
    'Invalid cron trigger interval',
  );
};
