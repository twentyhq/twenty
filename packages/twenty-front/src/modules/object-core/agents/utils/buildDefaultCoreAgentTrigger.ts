import { type AgentTrigger } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { computeCronPatternFromWorkflowCronSchedule } from '@/workflow/workflow-trigger/utils/computeCronPatternFromWorkflowCronSchedule';
import { getCronTriggerDefaultSchedule } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSchedule';

export const buildDefaultCoreAgentTrigger = (
  trigger: { type: 'CRON' } | { type: 'DATABASE_EVENT'; eventName: string },
): AgentTrigger => {
  if (trigger.type === 'CRON') {
    return {
      id: v4(),
      type: 'CRON',
      isActive: true,
      instructions: null,
      settings: {
        pattern: computeCronPatternFromWorkflowCronSchedule(
          getCronTriggerDefaultSchedule('DAYS'),
        ),
      },
    };
  }

  return {
    id: v4(),
    type: 'DATABASE_EVENT',
    isActive: true,
    instructions: null,
    settings: { eventName: trigger.eventName },
  };
};
