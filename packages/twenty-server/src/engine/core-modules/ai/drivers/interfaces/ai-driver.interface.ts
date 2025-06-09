import { CoreMessage, StreamTextResult, Tool, ToolChoice } from 'ai';

export interface AiDriver {
  streamText(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      tools?: Record<string, Tool>;
      toolChoice?: ToolChoice<Record<string, Tool>>;
    },
  ): StreamTextResult<Record<string, Tool>, undefined>;
}
