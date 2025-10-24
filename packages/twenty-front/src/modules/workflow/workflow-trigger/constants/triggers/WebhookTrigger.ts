import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const WEBHOOK_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: 'Webhook',
  type: 'WEBHOOK',
  icon: 'IconWebhook',
};
