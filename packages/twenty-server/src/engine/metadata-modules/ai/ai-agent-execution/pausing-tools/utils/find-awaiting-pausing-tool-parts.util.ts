import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingToolAsk } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-ask.type';

// A call whose input cannot be read has no Ask: nothing can answer it.
export type AwaitingPausingToolPart = {
  toolName: string;
  toolCallId: string;
  ask: PausingToolAsk | null;
};

// A step can call several pausing tools at once: each waits on its own Ask,
// in the order the model made the calls.
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
        ask: pausingTool.parseCall(part.input)?.buildAsk() ?? null,
      },
    ];
  });
