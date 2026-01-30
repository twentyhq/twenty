import { Module } from '@nestjs/common';

import { AddPackagesCommand } from 'src/engine/core-modules/logic-function/logic-function-executor/commands/add-packages.command';
import { LogicFunctionExecutionOrchestratorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-execution-orchestrator.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';

@Module({
  providers: [
    LogicFunctionExecutorService,
    LogicFunctionExecutionOrchestratorService,
    AddPackagesCommand,
  ],
  exports: [
    LogicFunctionExecutorService,
    LogicFunctionExecutionOrchestratorService,
  ],
})
export class LogicFunctionExecutorModule {}
