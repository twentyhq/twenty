import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const DELAY_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'DELAY'>;
  icon: string;
} = {
  defaultLabel: msg`Delay`,
  type: 'DELAY',
  icon: 'IconPlayerPause',
};
