import { type DynamicModule, Global, Module } from '@nestjs/common';

import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Global()
@Module({})
export class LogicFunctionModule {
  static forRoot(): DynamicModule {
    return {
      module: LogicFunctionModule,
      imports: [
        TwentyConfigModule,
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
      ],
      providers: [LogicFunctionDriverFactory],
      exports: [
        LogicFunctionDriverFactory,
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
      ],
    };
  }
}
