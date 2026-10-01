import {
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_EMAIL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';
import { PROPOSE_EMAIL_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-email.pausing-tool';
import { REQUEST_FORM_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';
import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';

// Tools whose call ends the turn until a person submits its output through
// answerToolCall.
export const PAUSING_TOOLS: ReadonlyMap<string, PausingTool> = new Map([
  [ASK_QUESTIONS_TOOL_NAME, ASK_QUESTIONS_PAUSING_TOOL],
  [PROPOSE_EMAIL_TOOL_NAME, PROPOSE_EMAIL_PAUSING_TOOL],
  [REQUEST_FORM_TOOL_NAME, REQUEST_FORM_PAUSING_TOOL],
]);
