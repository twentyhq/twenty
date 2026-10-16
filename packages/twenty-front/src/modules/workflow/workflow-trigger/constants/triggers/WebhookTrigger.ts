import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const WEBHOOK_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- Persisted trigger names are translated by getWorkflowStepDisplayName.
  defaultLabel: 'Webhook',
  type: 'WEBHOOK',
  icon: 'IconWebhook',
};
