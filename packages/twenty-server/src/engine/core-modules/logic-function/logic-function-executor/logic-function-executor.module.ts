import { Module } from '@nestjs/common';

import { AddPackagesCommand } from 'src/engine/core-modules/logic-function/logic-function-executor/commands/add-packages.command';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';

@Module({
  providers: [LogicFunctionExecutorService, AddPackagesCommand],
  exports: [LogicFunctionExecutorService],
})
export class LogicFunctionExecutorModule {}
