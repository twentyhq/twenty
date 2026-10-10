import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const CODE_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'CODE'>;
  icon: string;
} = {
  defaultLabel: msg`Code - Logic Function`,
  type: 'CODE',
  icon: 'IconCode',
};
