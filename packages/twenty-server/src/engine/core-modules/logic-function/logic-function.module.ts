import { type DynamicModule, Global, Module } from '@nestjs/common';

import { type LogicFunctionExecutorModuleAsyncOptions } from 'src/engine/core-modules/logic-function/logic-function-executor/interfaces/logic-function-executor.interface';

import { LogicFunctionBuildModule } from 'src/engine/core-modules/logic-function/logic-function-build/logic-function-build.module';
import { LogicFunctionDriversModule } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-drivers.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { CoreLogicFunctionLayerModule } from 'src/engine/core-modules/logic-function/logic-function-layer/logic-function-layer.module';
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
        LogicFunctionBuildModule,
        CoreLogicFunctionLayerModule,
        LogicFunctionTriggerModule,
      ],
      exports: [
        LogicFunctionDriversModule,
        LogicFunctionExecutorModule,
        LogicFunctionBuildModule,
        CoreLogicFunctionLayerModule,
        LogicFunctionTriggerModule,
      ],
    };
  }
}
