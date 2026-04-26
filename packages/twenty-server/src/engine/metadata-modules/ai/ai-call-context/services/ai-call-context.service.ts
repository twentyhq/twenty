import { Injectable } from '@nestjs/common';

import { aiCallContextStorage } from 'src/engine/metadata-modules/ai/ai-call-context/storage/ai-call-context.storage';
import { type AiCallContext } from 'src/engine/metadata-modules/ai/ai-call-context/types/ai-call-context.type';

@Injectable()
export class AiCallContextService {
  run<T>(context: AiCallContext, fn: () => Promise<T>): Promise<T> {
    return aiCallContextStorage.run(context, fn);
  }

  getContext(): AiCallContext | undefined {
    return aiCallContextStorage.getStore();
  }
}
