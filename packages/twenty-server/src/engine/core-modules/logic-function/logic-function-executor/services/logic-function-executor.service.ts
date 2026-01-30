import { Inject, Injectable } from '@nestjs/common';

import {
  LogicFunctionExecutorDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-executor-driver.interface';

import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/logic-function-executor.constants';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

@Injectable()
export class LogicFunctionExecutorService
  implements LogicFunctionExecutorDriver
{
  constructor(
    @Inject(LOGIC_FUNCTION_EXECUTOR_DRIVER)
    private driver: LogicFunctionExecutorDriver,
  ) {}

  async delete(flatLogicFunction: FlatLogicFunction): Promise<void> {
    return this.driver.delete(flatLogicFunction);
  }

  async execute(
    params: LogicFunctionExecuteParams,
  ): Promise<LogicFunctionExecuteResult> {
    return this.driver.execute(params);
  }
}
