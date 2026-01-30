import { type DynamicModule, Module } from '@nestjs/common';

import {
  LogicFunctionExecutorDriverType,
  type LogicFunctionExecutorModuleAsyncOptions,
} from 'src/engine/core-modules/logic-function/logic-function-executor/interfaces/logic-function-executor.interface';

import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LambdaDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/logic-function-executor.constants';

@Module({})
export class LogicFunctionDriversModule {
  static forRootAsync(
    options: LogicFunctionExecutorModuleAsyncOptions,
  ): DynamicModule {
    const provider = {
      provide: LOGIC_FUNCTION_EXECUTOR_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        switch (config?.type) {
          case LogicFunctionExecutorDriverType.DISABLED:
            return new DisabledDriver();
          case LogicFunctionExecutorDriverType.LOCAL:
            return new LocalDriver(config.options);
          case LogicFunctionExecutorDriverType.LAMBDA:
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
      exports: [LOGIC_FUNCTION_EXECUTOR_DRIVER],
    };
  }
}
