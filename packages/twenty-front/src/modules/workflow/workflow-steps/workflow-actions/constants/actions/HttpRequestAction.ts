import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const HTTP_REQUEST_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'HTTP_REQUEST'>;
  icon: string;
} = {
  defaultLabel: msg`HTTP Request`,
  type: 'HTTP_REQUEST',
  icon: 'IconWorld',
};
