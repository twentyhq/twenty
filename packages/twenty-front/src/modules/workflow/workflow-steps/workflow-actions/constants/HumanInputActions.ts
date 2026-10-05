import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { FORM_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FormAction';
import { SEND_CHAT_MESSAGE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendChatMessageAction';

export const HUMAN_INPUT_ACTIONS: Array<{
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'FORM' | 'SEND_CHAT_MESSAGE'>;
  icon: string;
}> = [FORM_ACTION, SEND_CHAT_MESSAGE_ACTION];
