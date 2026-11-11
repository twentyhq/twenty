import { computeCronPatternFromWorkflowCronSchedule } from 'twenty-shared/workflow';

import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';

export const convertScheduleToCronExpression = (
  trigger: WorkflowCronTrigger,
): string | null =>
  computeCronPatternFromWorkflowCronSchedule(trigger.settings);
