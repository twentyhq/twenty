import { type ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

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

// TODO refactor to be using FlatServerlessFunction
export interface ServerlessDriver {
  delete(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  execute({
    serverlessFunction,
    payload,
    version,
    env,
  }: {
    serverlessFunction: ServerlessFunctionEntity;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult>;
}
