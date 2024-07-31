import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export type ServerlessExecuteError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type ServerlessExecuteResult = {
  data: object | null;
  duration: number;
  status: 200 | 500;
  error?: ServerlessExecuteError;
};

export interface ServerlessDriver {
  delete(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  build(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object | undefined,
  ): Promise<ServerlessExecuteResult>;
}
