import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const ITERATOR_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'ITERATOR'>;
  icon: string;
} = {
  defaultLabel: msg`Iterator`,
  type: 'ITERATOR',
  icon: 'IconRepeat',
};
