import { CoreMessage, StreamTextResult } from 'ai';

export interface AiDriver {
  streamText(
    messages: CoreMessage[],
    options?: { temperature?: number; maxTokens?: number },
  ): StreamTextResult<Record<string, never>, undefined>;
}
