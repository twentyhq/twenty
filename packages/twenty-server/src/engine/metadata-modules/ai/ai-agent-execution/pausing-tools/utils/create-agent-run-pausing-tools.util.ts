import { type ToolSet } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { type AgentRunCapabilities } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-capabilities.type';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';

// built from the capabilities alone, so a run continued later gets the toolset it paused with
export const createAgentRunPausingTools = ({
  canAskHumans,
  canWait,
}: AgentRunCapabilities): ToolSet => ({
  ...(canWait ? createAgentWaitTools() : {}),
  ...(canAskHumans
    ? {
        [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool({
          isWorkspaceSetupThread: false,
        }),
        [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
      }
    : {}),
});
