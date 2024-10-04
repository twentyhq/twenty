import { Global, DynamicModule } from '@nestjs/common';

import {
  LLMTracingModuleAsyncOptions,
  LLMTracingDriver,
} from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { LangfuseDriver } from 'src/engine/core-modules/llm-tracing/drivers/langfuse.driver';
import { ConsoleDriver } from 'src/engine/core-modules/llm-tracing/drivers/console.driver';
import { LLMTracingService } from 'src/engine/core-modules/llm-tracing/llm-tracing.service';
import { LLM_TRACING_DRIVER } from 'src/engine/core-modules/llm-tracing/llm-tracing.constants';

@Global()
export class LLMTracingModule {
  static forRoot(options: LLMTracingModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LLM_TRACING_DRIVER,
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config.type) {
          case LLMTracingDriver.Langfuse: {
            return new LangfuseDriver(config.options);
          }
          case LLMTracingDriver.Console: {
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
