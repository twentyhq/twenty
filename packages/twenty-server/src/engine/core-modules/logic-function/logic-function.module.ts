import { type DynamicModule, Global, Module } from '@nestjs/common';

import { type LogicFunctionExecutorModuleAsyncOptions } from 'src/engine/core-modules/logic-function/logic-function-executor/interfaces/logic-function-executor.interface';

import { LogicFunctionDriversModule } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-drivers.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { LogicFunctionSourceBuilderModule } from 'src/engine/core-modules/logic-function/logic-function-source-builder/logic-function-source-builder.module';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';

@Global()
@Module({})
export class LogicFunctionModule {
  static forRootAsync(
    options: LogicFunctionExecutorModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: LogicFunctionModule,
      imports: [
        LogicFunctionDriversModule.forRootAsync(options),
        LogicFunctionExecutorModule,
        LogicFunctionSourceBuilderModule,
        LogicFunctionTriggerModule,
      ],
      exports: [
        LogicFunctionDriversModule,
        LogicFunctionExecutorModule,
        LogicFunctionSourceBuilderModule,
        LogicFunctionTriggerModule,
      ],
    };
  }
}
