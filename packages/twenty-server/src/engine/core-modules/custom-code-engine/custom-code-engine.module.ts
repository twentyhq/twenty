import { DynamicModule, Global } from '@nestjs/common';

import {
  CustomCodeEngineDriverType,
  CustomCodeEngineModuleAsyncOptions,
} from 'src/engine/core-modules/custom-code-engine/interfaces/custom-code-engine.interface';

import { CustomCodeEngineService } from 'src/engine/core-modules/custom-code-engine/custom-code-engine.service';
import { CUSTOM_CODE_ENGINE_DRIVER } from 'src/engine/core-modules/custom-code-engine/custom-code-engine.constants';
import { LocalDriver } from 'src/engine/core-modules/custom-code-engine/drivers/local.driver';
import { LambdaDriver } from 'src/engine/core-modules/custom-code-engine/drivers/lambda.driver';

@Global()
export class CustomCodeEngineModule {
  static forRootAsync(
    options: CustomCodeEngineModuleAsyncOptions,
  ): DynamicModule {
    const provider = {
      provide: CUSTOM_CODE_ENGINE_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return config?.type === CustomCodeEngineDriverType.Local
          ? new LocalDriver(config.options)
          : new LambdaDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: CustomCodeEngineModule,
      imports: options.imports || [],
      providers: [CustomCodeEngineService, provider],
      exports: [CustomCodeEngineService],
    };
  }
}
