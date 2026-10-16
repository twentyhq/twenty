import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const MANUAL_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- Persisted trigger names are translated by getWorkflowStepDisplayName.
  defaultLabel: 'Launch manually',
  type: 'MANUAL',
  icon: 'IconHandMove',
};
