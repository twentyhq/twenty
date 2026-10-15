import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const CLASSIFY_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'CLASSIFY'>;
  icon: string;
} = {
  defaultLabel: msg`Classify (Jev)`,
  type: 'CLASSIFY',
  icon: 'IconCategory',
};
