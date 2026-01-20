import { type FlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/types/flat-serverless-function-layer.type';
import { type ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export type ServerlessExecuteError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string | string[];
};

export type ServerlessExecuteResult = {
  data: object | null;
  duration: number;
  logs: string;
  status: ServerlessFunctionExecutionStatus;
  error?: ServerlessExecuteError;
};

export interface ServerlessDriver {
  delete(flatServerlessFunction: FlatServerlessFunction): Promise<void>;
  execute({
    flatServerlessFunction,
    flatServerlessFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatServerlessFunction: FlatServerlessFunction;
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult>;
}
