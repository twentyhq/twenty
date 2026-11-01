import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { doNotTranslate } from 'twenty-shared/i18n';

export const MANUAL_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: doNotTranslate('Launch manually'),
  type: 'MANUAL',
  icon: 'IconHandMove',
};
