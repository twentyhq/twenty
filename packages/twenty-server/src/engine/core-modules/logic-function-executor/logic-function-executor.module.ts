import { type DynamicModule, Global } from '@nestjs/common';

import { AddPackagesCommand } from 'src/engine/core-modules/logic-function-executor/commands/add-packages.command';
import { DisabledDriver } from 'src/engine/core-modules/logic-function-executor/drivers/disabled.driver';
import { LambdaDriver } from 'src/engine/core-modules/logic-function-executor/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function-executor/drivers/local.driver';
import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.constants';
import {
  LogicFunctionExecutorDriverType,
  type LogicFunctionExecutorModuleAsyncOptions,
} from 'src/engine/core-modules/logic-function-executor/logic-function-executor.interface';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.service';

@Global()
export class LogicFunctionExecutorModule {
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
      module: LogicFunctionExecutorModule,
      imports: options.imports || [],
      providers: [LogicFunctionExecutorService, provider, AddPackagesCommand],
      exports: [LogicFunctionExecutorService],
    };
  }
}
