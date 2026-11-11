import { type AgentCronTrigger } from 'twenty-shared/application';
import { computeWorkflowCronScheduleFromCronPattern } from 'twenty-shared/workflow';

import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';

export const getWorkflowCronTriggerFromCoreAgentTrigger = (
  trigger: Pick<AgentCronTrigger, 'settings'>,
): WorkflowCronTrigger => ({
  type: 'CRON',
  settings: {
    ...computeWorkflowCronScheduleFromCronPattern(trigger.settings.pattern),
    outputSchema: {},
  },
});
