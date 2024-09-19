import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';

export type ServerlessExecuteError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type ServerlessExecuteResult = {
  data: object | null;
  duration: number;
  status: ServerlessFunctionExecutionStatus;
  error?: ServerlessExecuteError;
};

export interface ServerlessDriver {
  delete(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  build(
    serverlessFunction: ServerlessFunctionEntity,
    version: string,
  ): Promise<void>;
  publish(serverlessFunction: ServerlessFunctionEntity): Promise<string>;
  execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult>;
}
