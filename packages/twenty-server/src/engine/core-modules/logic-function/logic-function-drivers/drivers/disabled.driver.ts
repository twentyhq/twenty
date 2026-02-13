import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export class DisabledDriver implements LogicFunctionDriver {
  async delete(): Promise<void> {
    // No-op when disabled
  }

  async execute(): Promise<LogicFunctionExecuteResult> {
    throw new LogicFunctionException(
      'Logic function execution is disabled. Set LOGIC_FUNCTION_TYPE to LOCAL or LAMBDA to enable.',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    );
  }
}
