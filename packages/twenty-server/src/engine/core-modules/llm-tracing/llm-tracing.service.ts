import { Injectable, Inject } from '@nestjs/common';

import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/drivers/interfaces/llm-tracing-driver.interface';

import { LLM_TRACING_DRIVER } from 'src/engine/core-modules/llm-tracing/llm-tracing.constants';

@Injectable()
export class LLMTracingService {
  constructor(@Inject(LLM_TRACING_DRIVER) private driver: LLMTracingDriver) {}

  getCallbackHandler(metadata: Record<string, unknown>): BaseCallbackHandler {
    return this.driver.getCallbackHandler(metadata);
  }
}
