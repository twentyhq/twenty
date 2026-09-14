import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const RUN_WORKFLOW_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'RUN_WORKFLOW'>;
  icon: string;
} = {
  defaultLabel: 'Run workflow',
  type: 'RUN_WORKFLOW',
  icon: 'IconSettingsAutomation',
};
