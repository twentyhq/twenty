import { openai } from '@ai-sdk/openai';
import { CoreMessage, StreamTextResult, streamText } from 'ai';

import { AiDriver } from 'src/engine/core-modules/ai/drivers/interfaces/ai-driver.interface';

export class OpenAIDriver implements AiDriver {
  streamText(
    messages: CoreMessage[],
    options?: { temperature?: number; maxTokens?: number },
  ): StreamTextResult<Record<string, never>, undefined> {
    return streamText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
  }
}
