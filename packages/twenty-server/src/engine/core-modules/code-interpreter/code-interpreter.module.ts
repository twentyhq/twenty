import { type DynamicModule, Global } from '@nestjs/common';

import { CODE_INTERPRETER_DRIVER } from './code-interpreter.constants';
import {
  CodeInterpreterDriverType,
  type CodeInterpreterModuleAsyncOptions,
} from './code-interpreter.interface';
import { CodeInterpreterService } from './code-interpreter.service';

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

        return config.type === CodeInterpreterDriverType.LOCAL
          ? new LocalDriver(config.options)
          : new E2BDriver(config.options);
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
