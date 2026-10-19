import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { doNotTranslate } from 'twenty-shared/i18n';

export const WEBHOOK_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: doNotTranslate('Webhook'),
  type: 'WEBHOOK',
  icon: 'IconWebhook',
};
