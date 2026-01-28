import { Inject, Injectable } from '@nestjs/common';

import {
  LogicFunctionExecutorDriver,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function-executor/drivers/interfaces/logic-function-executor-driver.interface';

import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.constants';
import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';
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

  async execute({
    flatLogicFunction,
    flatLogicFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatLogicFunctionLayer: FlatLogicFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<LogicFunctionExecuteResult> {
    return this.driver.execute({
      flatLogicFunction,
      flatLogicFunctionLayer,
      payload,
      version,
      env,
    });
  }
}
