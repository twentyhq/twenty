import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export interface ServerlessDriver {
  delete(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  build(serverlessFunction: ServerlessFunctionEntity): Promise<void>;
  execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object | undefined,
  ): Promise<object>;
}
