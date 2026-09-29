import { isObject } from '@sniptt/guards';
import { getToolName, isToolUIPart, type ToolUIPart } from 'ai';
import {
  ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

export const isSucceededAttachConversationToRecordToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart =>
  isToolUIPart(part) &&
  getToolName(part) === ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME &&
  part.state === 'output-available' &&
  isObject(part.output) &&
  'success' in part.output &&
  part.output.success === true;
