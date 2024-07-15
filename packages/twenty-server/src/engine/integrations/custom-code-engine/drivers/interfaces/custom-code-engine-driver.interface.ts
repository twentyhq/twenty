import { FileUpload } from 'graphql-upload';

import { FunctionWorkspaceEntity } from 'src/modules/function/standard-objects/function.workspace-entity';

export type CustomCodeEngineServiceUpsertType = {
  sourceCodePath: string;
  buildSourcePath: string;
};

export interface CustomCodeEngineDriver {
  execute(
    functionToExecute: FunctionWorkspaceEntity,
    payload: object | undefined,
  ): Promise<object>;
  generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ): Promise<CustomCodeEngineServiceUpsertType>;
}
