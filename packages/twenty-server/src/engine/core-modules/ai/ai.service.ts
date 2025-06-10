import { Inject, Injectable } from '@nestjs/common';

import { CoreMessage, StreamTextResult } from 'ai';

import { AiDriver } from 'src/engine/core-modules/ai/drivers/interfaces/ai-driver.interface';

import { AI_DRIVER } from 'src/engine/core-modules/ai/ai.constants';

@Injectable()
export class AiService {
  constructor(@Inject(AI_DRIVER) private driver: AiDriver) {}

  streamText(
    messages: CoreMessage[],
    options?: { temperature?: number; maxTokens?: number },
  ): StreamTextResult<Record<string, never>, undefined> {
    return this.driver.streamText(messages, options);
  }
}
