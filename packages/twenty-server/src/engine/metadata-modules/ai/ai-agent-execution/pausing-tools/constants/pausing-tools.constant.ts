import {
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

import { ASK_QUESTION_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';
import { PROPOSE_TOOL_CALL_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { REQUEST_FORM_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';
import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';

export const PAUSING_TOOLS: ReadonlyMap<string, PausingTool> = new Map([
  [ASK_QUESTION_TOOL_NAME, ASK_QUESTION_PAUSING_TOOL],
  // no longer offered, but calls asked before can still be answered or closed
  [ASK_QUESTIONS_TOOL_NAME, ASK_QUESTIONS_PAUSING_TOOL],
  [PROPOSE_TOOL_CALL_TOOL_NAME, PROPOSE_TOOL_CALL_PAUSING_TOOL],
  [REQUEST_FORM_TOOL_NAME, REQUEST_FORM_PAUSING_TOOL],
]);
