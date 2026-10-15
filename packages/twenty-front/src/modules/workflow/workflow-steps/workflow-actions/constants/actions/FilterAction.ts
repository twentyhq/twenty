import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const FILTER_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'FILTER'>;
  icon: string;
} = {
  defaultLabel: msg`Filter`,
  type: 'FILTER',
  icon: 'IconFilter',
};
