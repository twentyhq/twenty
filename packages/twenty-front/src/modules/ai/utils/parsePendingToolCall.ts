import { isString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  type AskQuestionItem,
  buildFallbackProposedToolCall,
  type ExtendedUIMessagePart,
  PROPOSE_TOOL_CALL_TOOL_NAME,
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
    case ASK_QUESTION_TOOL_NAME:
      return isString(input.question) &&
        Array.isArray(input.options) &&
        isNonEmptyArray(input.options)
        ? {
            toolCallId,
            kind: 'question',
            question: input as AskQuestionItem,
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
    case PROPOSE_TOOL_CALL_TOOL_NAME: {
      if (
        isPlainObject(proposal) &&
        isString(proposal.toolName) &&
        isString(proposal.toolLabel) &&
        isString(proposal.summary) &&
        isString(proposal.template) &&
        isPlainObject(proposal.arguments)
      ) {
        return {
          toolCallId,
          kind: 'toolCallApproval',
          proposal: proposal as ProposedToolCall,
        };
      }

      // the server answers a call recorded without its proposal as a generic one, so the card does too
      return isString(input.toolName) &&
        isString(input.summary) &&
        isPlainObject(input.arguments)
        ? {
            toolCallId,
            kind: 'toolCallApproval',
            proposal: buildFallbackProposedToolCall({
              toolName: input.toolName,
              summary: input.summary,
              arguments: input.arguments,
            }),
          }
        : null;
    }
    default:
      return null;
  }
};
