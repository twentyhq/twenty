import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';

export const getEffectiveToolName = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): string => unwrapToolPartInput(toolPart).toolName;
