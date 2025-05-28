import { DynamicModule, Global } from '@nestjs/common';

import {
    LLMTracingDriver,
    LLMTracingModuleAsyncOptions,
} from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { ConsoleDriver } from 'src/engine/core-modules/llm-tracing/drivers/console.driver';
import { LangfuseDriver } from 'src/engine/core-modules/llm-tracing/drivers/langfuse.driver';
import { LLM_TRACING_DRIVER } from 'src/engine/core-modules/llm-tracing/llm-tracing.constants';
import { LLMTracingService } from 'src/engine/core-modules/llm-tracing/llm-tracing.service';

@Global()
export class LLMTracingModule {
  static forRoot(options: LLMTracingModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LLM_TRACING_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config.type) {
          case LLMTracingDriver.LANGFUSE: {
            return new LangfuseDriver(config.options);
          }
          case LLMTracingDriver.CONSOLE: {
            return new ConsoleDriver();
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: LLMTracingModule,
      providers: [LLMTracingService, provider],
      exports: [LLMTracingService],
    };
  }
}
