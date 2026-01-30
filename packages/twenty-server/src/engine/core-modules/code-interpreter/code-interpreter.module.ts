import { type DynamicModule, Global } from '@nestjs/common';

import { CODE_INTERPRETER_DRIVER } from './code-interpreter.constants';
import {
  CodeInterpreterDriverType,
  type CodeInterpreterModuleAsyncOptions,
} from './code-interpreter.interface';
import { CodeInterpreterService } from './code-interpreter.service';

import { DisabledDriver } from './drivers/disabled.driver';
import { E2BDriver } from './drivers/e2b.driver';
import { LocalDriver } from './drivers/local.driver';

@Global()
export class CodeInterpreterModule {
  static forRootAsync(
    options: CodeInterpreterModuleAsyncOptions,
  ): DynamicModule {
    const provider = {
      provide: CODE_INTERPRETER_DRIVER,
      useFactory: async (...args: unknown[]) => {
        const config = await options.useFactory(...args);

        switch (config.type) {
          case CodeInterpreterDriverType.LOCAL:
            return new LocalDriver(config.options);
          case CodeInterpreterDriverType.E_2_B:
            return new E2BDriver(config.options);
          case CodeInterpreterDriverType.DISABLED:
            return new DisabledDriver(config.options.reason);
        }
      },
      inject: options.inject ?? [],
    };

    return {
      module: CodeInterpreterModule,
      imports: options.imports ?? [],
      providers: [CodeInterpreterService, provider],
      exports: [CodeInterpreterService],
    };
  }
}
