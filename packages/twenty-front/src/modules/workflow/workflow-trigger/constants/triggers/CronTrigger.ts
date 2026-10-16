import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const CRON_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- Persisted trigger names are translated by getWorkflowStepDisplayName.
  defaultLabel: 'On a schedule',
  type: 'CRON',
  icon: 'IconClock',
};
