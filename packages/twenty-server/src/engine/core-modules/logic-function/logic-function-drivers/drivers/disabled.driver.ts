import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteResult,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export class DisabledDriver implements LogicFunctionDriver {
  constructor(private readonly reason?: string) {}

  async delete(): Promise<void> {
    // No-op when disabled
  }

  async deleteApplicationResources(): Promise<void> {
    // No-op when disabled
  }

  async execute(): Promise<LogicFunctionExecuteResult> {
    throw new LogicFunctionException(
      this.reason ??
        'Logic function execution is disabled. Set LOGIC_FUNCTION_TYPE to LOCAL or LAMBDA to enable.',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    );
  }

  async transpile(): Promise<LogicFunctionTranspileResult> {
    throw new LogicFunctionException(
      this.reason ??
        'Logic function transpilation is disabled. Set LOGIC_FUNCTION_TYPE to LOCAL or LAMBDA to enable.',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    );
  }

  async installPrebuiltBundle(): Promise<void> {
    throw new LogicFunctionException(
      this.reason ??
        'Logic function prebuilt install is disabled. Set LOGIC_FUNCTION_TYPE to LOCAL or LAMBDA to enable.',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    );
  }

  async getInstalledBundleChecksum(): Promise<string | null> {
    return null;
  }
}
