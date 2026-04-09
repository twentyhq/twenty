import { type DynamicModule, Global, Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Global()
@Module({})
export class LogicFunctionModule {
  static forRoot(): DynamicModule {
    return {
      module: LogicFunctionModule,
      imports: [
        TwentyConfigModule,
        CacheLockModule,
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
        SdkClientModule,
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
