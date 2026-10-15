import { getToolName, isToolUIPart } from 'ai';
import {
  type ExtendedUIMessagePart,
  PAUSING_TOOL_NAMES,
} from 'twenty-shared/ai';

export const isPausingToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) && PAUSING_TOOL_NAMES.has(getToolName(part));
