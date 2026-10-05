import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const AI_AGENT_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'AI_AGENT'>;
  icon: string;
} = {
  defaultLabel: msg`Agent`,
  type: 'AI_AGENT',
  icon: 'IconLego',
};
