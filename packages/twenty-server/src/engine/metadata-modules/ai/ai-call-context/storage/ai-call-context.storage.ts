import { AsyncLocalStorage } from 'async_hooks';

import { type AiCallContext } from 'src/engine/metadata-modules/ai/ai-call-context/types/ai-call-context.type';

export const aiCallContextStorage = new AsyncLocalStorage<AiCallContext>();
