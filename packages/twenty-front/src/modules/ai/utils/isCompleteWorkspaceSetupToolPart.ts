import { getToolName, isToolUIPart, type ToolUIPart } from 'ai';
import {
  COMPLETE_WORKSPACE_SETUP_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

export const isCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart =>
  isToolUIPart(part) &&
  getToolName(part) === COMPLETE_WORKSPACE_SETUP_TOOL_NAME;
