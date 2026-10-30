import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const DELETE_RECORD_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'DELETE_RECORD'>;
  icon: string;
} = {
  defaultLabel: msg`Delete Record`,
  type: 'DELETE_RECORD',
  icon: 'IconTrash',
};
