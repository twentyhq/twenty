import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';

export type AwaitingPausingToolPart = {
  toolName: string;
  toolCallId: string;
  input: unknown;
  pausingTool: PausingTool;
};

export const findAwaitingPausingToolPart = (
  parts: ExtendedUIMessagePart[],
): AwaitingPausingToolPart | undefined => {
  for (const part of parts) {
    if (!isToolUIPart(part)) {
      continue;
    }

    const toolName = getToolName(part);
    const pausingTool = PAUSING_TOOLS.get(toolName);

    if (isDefined(pausingTool) && pausingTool.isAwaitingOutput(part.output)) {
      return {
        toolName,
        toolCallId: part.toolCallId,
        input: part.input,
        pausingTool,
      };
    }
  }

  return undefined;
};
