import {
  type ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

export class DisabledDriver implements ServerlessDriver {
  async delete(): Promise<void> {
    // No-op when disabled
  }

  async execute(): Promise<ServerlessExecuteResult> {
    throw new ServerlessFunctionException(
      'Serverless function execution is disabled. Set SERVERLESS_TYPE to LOCAL or LAMBDA to enable.',
      ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_DISABLED,
    );
  }
}
