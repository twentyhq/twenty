import { pendingWakeUpConditionSchema } from 'twenty-shared/pending-wake-up';
import { isPlainObject } from 'twenty-shared/utils';

import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { type AgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-wait.type';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';

// The wait a run paused on, when it paused on a wait tool call
export const findAgentRunWait = (
  toolResults: { toolCallId: string; toolName: string; output: unknown }[],
): AgentRunWait | undefined => {
  for (const { toolCallId, toolName, output } of toolResults) {
    if (
      !AGENT_WAIT_TOOL_NAMES.includes(toolName) ||
      !isAwaitingPausingToolOutput(output) ||
      !isPlainObject(output) ||
      !isPlainObject(output.result)
    ) {
      continue;
    }

    const parsedWait = pendingWakeUpConditionSchema.safeParse(
      output.result.wait,
    );

    if (parsedWait.success) {
      return { toolCallId, condition: parsedWait.data };
    }
  }

  return undefined;
};
