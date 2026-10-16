import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const CREATE_RECORD_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'CREATE_RECORD'>;
  icon: string;
} = {
  defaultLabel: msg`Create Record`,
  type: 'CREATE_RECORD',
  icon: 'IconPlus',
};
