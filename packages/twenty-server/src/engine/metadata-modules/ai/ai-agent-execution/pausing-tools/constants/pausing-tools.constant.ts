import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';

import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';
import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';

// Tools whose call ends the turn until a person submits its output. Each call
// opens an Ask, and answerAsk is the only way to answer it.
export const PAUSING_TOOLS: ReadonlyMap<string, PausingTool> = new Map([
  [ASK_QUESTIONS_TOOL_NAME, ASK_QUESTIONS_PAUSING_TOOL],
]);
