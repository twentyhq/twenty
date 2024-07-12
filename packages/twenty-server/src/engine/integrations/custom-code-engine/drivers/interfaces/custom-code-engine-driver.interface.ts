import { FileUpload } from 'graphql-upload';

import { FunctionWorkspaceEntity } from 'src/modules/function/standard-objects/function.workspace-entity';

export type CustomCodeEngineServiceUpsertType = {
  sourceCodePath: string;
  builtSourcePath?: string;
  lambdaName?: string;
};

export interface CustomCodeEngineDriver {
  execute(
    functionToExecute: FunctionWorkspaceEntity,
    payload: object | undefined,
  ): Promise<object>;
  generateExecutable(
    file: FileUpload,
  ): Promise<CustomCodeEngineServiceUpsertType>;
}
