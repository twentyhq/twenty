import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const RECORD_IS_CREATED_TRIGGER: {
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
} = {
  defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
  type: 'DATABASE_EVENT',
  icon: 'IconPlaylistAdd',
  event: 'created',
};
