import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const WAIT_FOR_EVENT_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'WAIT_FOR_EVENT'>;
  icon: string;
} = {
  defaultLabel: msg`Wait for Event`,
  type: 'WAIT_FOR_EVENT',
  icon: 'IconHourglass',
};
