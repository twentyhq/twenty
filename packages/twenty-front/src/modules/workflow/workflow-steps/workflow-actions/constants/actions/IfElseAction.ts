import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const IF_ELSE_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'IF_ELSE'>;
  icon: string;
} = {
  defaultLabel: msg`If/else`,
  type: 'IF_ELSE',
  icon: 'IconArrowsSplit',
};
