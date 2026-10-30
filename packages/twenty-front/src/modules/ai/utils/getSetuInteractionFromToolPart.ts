import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type ParsedSetuInteractionResult,
  parseSetuInteractionResult,
  PROPOSE_CRM_ACTION_TOOL_NAME,
  type SetuInteractionReference,
  START_ACCOUNT_RESEARCH_TOOL_NAME,
} from 'twenty-shared/ai';

import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';

const RECORD_UPDATE_TOOL_NAME_PATTERN = /^update_[a-z]/;

// Only the tools the server routes through the reviewed actions policy or
// the task service can carry an interaction reference, and each only of its
// own kind; a reference in any other tool's output is ignored rather than
// rendered as a control.
const getAllowedInteractionKind = (
  toolName: string,
): SetuInteractionReference['kind'] | null => {
  if (
    toolName === PROPOSE_CRM_ACTION_TOOL_NAME ||
    toolName === 'send_email' ||
    RECORD_UPDATE_TOOL_NAME_PATTERN.test(toolName)
  ) {
    return 'action-review';
  }

  return toolName === START_ACCOUNT_RESEARCH_TOOL_NAME ? 'task-status' : null;
};

export const getSetuInteractionFromToolPart = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): Exclude<ParsedSetuInteractionResult, { status: 'invalid' }> | null => {
  const allowedKind = getAllowedInteractionKind(getEffectiveToolName(toolPart));

  if (toolPart.state !== 'output-available' || allowedKind === null) {
    return null;
  }

  const parsed = parseSetuInteractionResult(
    (toolPart.output as { result?: unknown } | null | undefined)?.result,
  );

  if (parsed.status === 'invalid') {
    return null;
  }

  return parsed.status === 'valid' && parsed.interaction.kind !== allowedKind
    ? null
    : parsed;
};
