import { type ToolSet } from 'ai';

import { WAIT_FOR_DURATION_TOOL_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/wait-for-duration-tool-name.constant';
import { WAIT_FOR_EVENT_TOOL_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/wait-for-event-tool-name.constant';
import { createWaitForDurationTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-wait-for-duration.tool';
import { createWaitForEventTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-wait-for-event.tool';
import { type AgentWaitSlot } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/agent-wait-slot.type';

// a run continues on one wait, so a second wait call of the same execution is refused instead of left pending
export const createAgentWaitTools = () => {
  const waitSlot: AgentWaitSlot = { isTaken: false };

  return {
    [WAIT_FOR_EVENT_TOOL_NAME]: createWaitForEventTool(waitSlot),
    [WAIT_FOR_DURATION_TOOL_NAME]: createWaitForDurationTool(waitSlot),
  } satisfies ToolSet;
};
