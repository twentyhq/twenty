import { type BuildFailure } from 'esbuild';

import { type ServerlessExecuteResult } from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';

export const formatBuildError = (
  error: BuildFailure,
  startTime: number,
): ServerlessExecuteResult => ({
  data: null,
  logs: '',
  duration: Date.now() - startTime,
  error: {
    errorType: 'BuildError',
    errorMessage: error.errors.map((e) => e.text).join('\n') || 'Unknown error',
    stackTrace: error.stack ? error.stack.split('\n') : [],
  },
  status: ServerlessFunctionExecutionStatus.ERROR,
});
