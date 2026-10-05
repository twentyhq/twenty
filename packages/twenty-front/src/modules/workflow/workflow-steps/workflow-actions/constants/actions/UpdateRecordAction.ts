import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const UPDATE_RECORD_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'UPDATE_RECORD'>;
  icon: string;
} = {
  defaultLabel: msg`Update Record`,
  type: 'UPDATE_RECORD',
  icon: 'IconReload',
};
