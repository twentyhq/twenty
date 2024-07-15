import { DynamicModule, Global } from '@nestjs/common';

import {
  CodeEngineDriverType,
  CodeEngineModuleAsyncOptions,
} from 'src/engine/core-modules/code-engine/interfaces/code-engine.interface';

import { CodeEngineService } from 'src/engine/core-modules/code-engine/code-engine.service';
import { CODE_ENGINE_DRIVER } from 'src/engine/core-modules/code-engine/code-engine.constants';
import { LocalDriver } from 'src/engine/core-modules/code-engine/drivers/local.driver';
import { LambdaDriver } from 'src/engine/core-modules/code-engine/drivers/lambda.driver';

@Global()
export class CodeEngineModule {
  static forRootAsync(options: CodeEngineModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: CODE_ENGINE_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return config?.type === CodeEngineDriverType.Local
          ? new LocalDriver(config.options)
          : new LambdaDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: CodeEngineModule,
      imports: options.imports || [],
      providers: [CodeEngineService, provider],
      exports: [CodeEngineService],
    };
  }
}
