import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { WORKFLOW_TRIGGER_DEFAULT_NAMES } from 'twenty-shared/workflow';

export const WEBHOOK_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: WORKFLOW_TRIGGER_DEFAULT_NAMES.WEBHOOK,
  type: 'WEBHOOK',
  icon: 'IconWebhook',
};
