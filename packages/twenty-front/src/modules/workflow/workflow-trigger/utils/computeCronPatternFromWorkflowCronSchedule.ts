import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkflowCronTriggerSchedule } from '@/workflow/workflow-trigger/types/WorkflowCronTriggerSchedule';

export const computeCronPatternFromWorkflowCronSchedule = (
  schedule: WorkflowCronTriggerSchedule,
): string => {
  switch (schedule.type) {
    case 'CUSTOM':
      return schedule.pattern;
    case 'DAYS':
      return `${schedule.schedule.minute} ${schedule.schedule.hour} */${schedule.schedule.day} * *`;
    case 'HOURS':
      return `${schedule.schedule.minute} */${schedule.schedule.hour} * * *`;
    case 'MINUTES':
      return `*/${schedule.schedule.minute} * * * *`;
  }

  return assertUnreachable(schedule, 'Invalid cron trigger schedule');
};
