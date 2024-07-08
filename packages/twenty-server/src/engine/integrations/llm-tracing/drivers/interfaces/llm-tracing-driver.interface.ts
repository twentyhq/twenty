import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

export interface LLMTracingDriver {
  getCallbackHandler(metadata: Record<string, unknown>): BaseCallbackHandler;
}
