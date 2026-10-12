import {
  type DynamicToolUIPart,
  type ReasoningUIPart,
  type ToolUIPart,
} from 'ai';

export type ThinkingStepPart = ReasoningUIPart | ToolUIPart | DynamicToolUIPart;
