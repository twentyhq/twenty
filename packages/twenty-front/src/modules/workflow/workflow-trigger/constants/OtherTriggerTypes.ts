import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { CRON_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/CronTrigger';
import { MANUAL_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/ManualTrigger';
import { WEBHOOK_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/WebhookTrigger';

export const OTHER_TRIGGER_TYPES: Array<{
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
}> = [MANUAL_TRIGGER, CRON_TRIGGER, WEBHOOK_TRIGGER];
