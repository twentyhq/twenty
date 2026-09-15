import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const PICK_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'PICK_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Pick Record',
  type: 'PICK_RECORD',
  icon: 'IconArrowsShuffle',
};
