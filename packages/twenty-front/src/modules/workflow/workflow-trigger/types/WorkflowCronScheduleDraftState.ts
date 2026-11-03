import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';

export type WorkflowCronScheduleDraftState = {
  sourceSettings: WorkflowCronTrigger['settings'];
  draft: CronScheduleDraft;
};
