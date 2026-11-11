import { Module } from '@nestjs/common';

import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';

@Module({
  imports: [ThrottlerModule],
  providers: [LogicFunctionExecutionThrottleService],
  exports: [LogicFunctionExecutionThrottleService],
})
export class LogicFunctionExecutionThrottleModule {}
