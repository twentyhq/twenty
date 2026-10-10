import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const FORM_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'FORM'>;
  icon: string;
} = {
  defaultLabel: msg`Form`,
  type: 'FORM',
  icon: 'IconForms',
};
