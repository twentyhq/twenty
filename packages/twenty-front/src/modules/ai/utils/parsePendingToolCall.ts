import { isString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
  type ExtendedUIMessagePart,
  PROPOSE_EMAIL_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposedEmail,
  type ProposedToolCall,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormField,
} from 'twenty-shared/ai';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

// The server validated input against the tool schema, so only each card's needed shape is checked.
export const parsePendingToolCall = (
  part: ExtendedUIMessagePart,
): AgentChatPendingToolCall | null => {
  if (
    !isToolUIPart(part) ||
    !isPlainObject(part.output) ||
    !isPlainObject(part.output.result) ||
    part.output.result.status !== 'pending' ||
    !isPlainObject(part.input)
  ) {
    return null;
  }

  const { toolCallId, input } = part;
  const { proposal } = part.output.result;

  switch (getToolName(part)) {
    case ASK_QUESTIONS_TOOL_NAME:
      return Array.isArray(input.questions) && isNonEmptyArray(input.questions)
        ? {
            toolCallId,
            kind: 'questions',
            questions: input.questions as AskQuestionItem[],
          }
        : null;
    case PROPOSE_EMAIL_TOOL_NAME:
      return isPlainObject(input.recipients) &&
        isString(input.subject) &&
        isString(input.body)
        ? {
            toolCallId,
            kind: 'emailApproval',
            email: input as ProposedEmail,
          }
        : null;
    case REQUEST_FORM_TOOL_NAME:
      return Array.isArray(input.fields) && isNonEmptyArray(input.fields)
        ? {
            toolCallId,
            kind: 'form',
            fields: input.fields as RequestFormField[],
          }
        : null;
    case PROPOSE_TOOL_CALL_TOOL_NAME:
      return isPlainObject(proposal) &&
        isString(proposal.toolName) &&
        isString(proposal.template) &&
        isPlainObject(proposal.arguments)
        ? {
            toolCallId,
            kind: 'toolCallApproval',
            proposal: proposal as ProposedToolCall,
          }
        : null;
    default:
      return null;
  }
};
