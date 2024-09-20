/* eslint-disable no-console */
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { Run } from '@langchain/core/tracers/base';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';

import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/drivers/interfaces/llm-tracing-driver.interface';

class WithMetadataConsoleCallbackHandler extends ConsoleCallbackHandler {
  private metadata: Record<string, unknown>;

  constructor(metadata: Record<string, unknown>) {
    super();
    this.metadata = metadata;
  }

  onChainStart(run: Run) {
    console.log(`Chain metadata: ${JSON.stringify(this.metadata)}`);
    super.onChainStart(run);
  }
}

export class ConsoleDriver implements LLMTracingDriver {
  getCallbackHandler(metadata: Record<string, unknown>): BaseCallbackHandler {
    return new WithMetadataConsoleCallbackHandler(metadata);
  }
}
