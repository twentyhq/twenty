import { Module } from '@nestjs/common';

import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [LogicFunctionPrebuiltWarmUpService],
  exports: [LogicFunctionPrebuiltWarmUpService],
})
export class LogicFunctionPrebuiltWarmUpModule {}
