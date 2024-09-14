import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import CallbackHandler from 'langfuse-langchain';

import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/drivers/interfaces/llm-tracing-driver.interface';

export interface LangfuseDriverOptions {
  secretKey: string;
  publicKey: string;
}

export class LangfuseDriver implements LLMTracingDriver {
  private options: LangfuseDriverOptions;

  constructor(options: LangfuseDriverOptions) {
    this.options = options;
  }

  getCallbackHandler(metadata: Record<string, unknown>): BaseCallbackHandler {
    return new CallbackHandler({
      secretKey: this.options.secretKey,
      publicKey: this.options.publicKey,
      baseUrl: 'https://cloud.langfuse.com',
      metadata: metadata,
    });
  }
}
