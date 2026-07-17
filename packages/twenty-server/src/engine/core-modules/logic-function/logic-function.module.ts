import { type DynamicModule, Global, Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { LogicFunctionWarmupModule } from 'src/engine/core-modules/logic-function/logic-function-warmup/logic-function-warmup.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

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
        LogicFunctionWarmupModule,
        SdkClientModule,
        WorkspaceCacheModule,
      ],
      providers: [
        LogicFunctionDriverFactory,
        {
          provide: LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN,
          useExisting: LogicFunctionDriverFactory,
        },
      ],
      exports: [
        LogicFunctionDriverFactory,
        LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN,
        LogicFunctionResourceModule,
        LogicFunctionTriggerModule,
        LogicFunctionExecutorModule,
      ],
    };
  }
}
