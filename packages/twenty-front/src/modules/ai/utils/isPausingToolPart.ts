import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { PAUSING_TOOL_NAMES } from '@/ai/constants/PausingToolNames';

export const isPausingToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) && PAUSING_TOOL_NAMES.has(getToolName(part));
