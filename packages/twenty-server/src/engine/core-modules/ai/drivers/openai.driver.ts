import { openai } from '@ai-sdk/openai';
import {
  CoreMessage,
  streamText,
  StreamTextResult,
  Tool,
  ToolChoice,
} from 'ai';

import { AiDriver } from 'src/engine/core-modules/ai/drivers/interfaces/ai-driver.interface';

export class OpenAIDriver implements AiDriver {
  streamText(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      tools?: Record<string, Tool>;
      toolChoice?: ToolChoice<Record<string, Tool>>;
    },
  ): StreamTextResult<Record<string, Tool>, undefined> {
    return streamText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      tools: options?.tools,
      toolChoice: options?.toolChoice,
    });
  }
}
