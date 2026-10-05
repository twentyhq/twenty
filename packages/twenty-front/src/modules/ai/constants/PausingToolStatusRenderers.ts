import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { type ComponentType } from 'react';
import {
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

import { AiChatFormStatusRenderer } from '@/ai/components/AiChatFormStatusRenderer';
import { AiChatQuestionStatusRenderer } from '@/ai/components/AiChatQuestionStatusRenderer';
import { AiChatToolCallApprovalStatusRenderer } from '@/ai/components/AiChatToolCallApprovalStatusRenderer';

type PausingToolStatusRendererProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
};

export const PAUSING_TOOL_STATUS_RENDERERS: Partial<
  Record<string, ComponentType<PausingToolStatusRendererProps>>
> = {
  [ASK_QUESTION_TOOL_NAME]: AiChatQuestionStatusRenderer,
  [ASK_QUESTIONS_TOOL_NAME]: AiChatQuestionStatusRenderer,
  [PROPOSE_TOOL_CALL_TOOL_NAME]: AiChatToolCallApprovalStatusRenderer,
  [REQUEST_FORM_TOOL_NAME]: AiChatFormStatusRenderer,
};
