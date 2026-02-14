import { type DynamicModule, Module } from '@nestjs/common';

import {
  LogicFunctionDriverType,
  LogicFunctionModuleAsyncOptions,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LambdaDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { LOGIC_FUNCTION_DRIVER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver.constants';

@Module({})
export class LogicFunctionDriversModule {
  static forRootAsync(options: LogicFunctionModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LOGIC_FUNCTION_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        switch (config?.type) {
          case LogicFunctionDriverType.DISABLED:
            return new DisabledDriver();
          case LogicFunctionDriverType.LOCAL:
            return new LocalDriver(config.options);
          case LogicFunctionDriverType.LAMBDA:
            return new LambdaDriver(config.options);
          default: {
            const unknownConfig = config as { type?: string };

            throw new Error(
              `Unknown logic function executor driver type: ${unknownConfig?.type}`,
            );
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: LogicFunctionDriversModule,
      imports: options.imports || [],
      providers: [provider],
      exports: [LOGIC_FUNCTION_DRIVER],
    };
  }
}
