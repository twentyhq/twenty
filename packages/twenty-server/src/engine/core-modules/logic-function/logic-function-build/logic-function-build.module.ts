import { Module } from '@nestjs/common';

import { LogicFunctionBuildService } from 'src/engine/core-modules/logic-function/logic-function-build/services/logic-function-build.service';

@Module({
  providers: [LogicFunctionBuildService],
  exports: [LogicFunctionBuildService],
})
export class LogicFunctionBuildModule {}
