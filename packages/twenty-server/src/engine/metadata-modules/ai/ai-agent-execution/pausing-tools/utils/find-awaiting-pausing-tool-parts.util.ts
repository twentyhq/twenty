import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

// A call whose input cannot be read cannot be answered.
export type AwaitingPausingToolPart = {
  toolName: string;
  toolCallId: string;
  isAnswerable: boolean;
};

export const findAwaitingPausingToolParts = (
  parts: ExtendedUIMessagePart[],
): AwaitingPausingToolPart[] =>
  parts.flatMap((part) => {
    if (!isToolUIPart(part)) {
      return [];
    }

    const toolName = getToolName(part);
    const pausingTool = PAUSING_TOOLS.get(toolName);

    if (!isDefined(pausingTool) || !pausingTool.isAwaitingOutput(part.output)) {
      return [];
    }

    return [
      {
        toolName,
        toolCallId: part.toolCallId,
        isAnswerable: isDefined(pausingTool.parseCall(part.input)),
      },
    ];
  });
