import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const PICK_RECORD_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'PICK_RECORD'>;
  icon: string;
} = {
  defaultLabel: msg`Pick Record`,
  type: 'PICK_RECORD',
  icon: 'IconArrowsShuffle',
};
