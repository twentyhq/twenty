import { type DynamicModule, Global, Module } from '@nestjs/common';

import { LogicFunctionModuleAsyncOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { LogicFunctionDriversModule } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-drivers.module';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';

@Global()
@Module({})
export class LogicFunctionModule {
  static forRootAsync(options: LogicFunctionModuleAsyncOptions): DynamicModule {
    return {
      module: LogicFunctionModule,
      imports: [
        LogicFunctionDriversModule.forRootAsync(options),
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
      ],
      exports: [
        LogicFunctionDriversModule,
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
      ],
    };
  }
}
