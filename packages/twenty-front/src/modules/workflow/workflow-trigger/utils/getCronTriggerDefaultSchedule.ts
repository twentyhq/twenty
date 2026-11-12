import { assertUnreachable } from 'twenty-shared/utils';

import { type CronTriggerInterval } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { type WorkflowCronTriggerSchedule } from '@/workflow/workflow-trigger/types/WorkflowCronTriggerSchedule';

const DEFAULT_CRON_PATTERN = '0 */1 * * *'; // Every hour

export const getCronTriggerDefaultSchedule = (
  cronTriggerInterval: CronTriggerInterval,
): WorkflowCronTriggerSchedule => {
  switch (cronTriggerInterval) {
    case 'DAYS':
      return { type: 'DAYS', schedule: { day: 1, hour: 0, minute: 0 } };
    case 'HOURS':
      return { type: 'HOURS', schedule: { hour: 1, minute: 0 } };
    case 'MINUTES':
      return { type: 'MINUTES', schedule: { minute: 1 } };
    case 'CUSTOM':
      return { type: 'CUSTOM', pattern: DEFAULT_CRON_PATTERN };
  }

  return assertUnreachable(
    cronTriggerInterval,
    'Invalid cron trigger interval',
  );
};
