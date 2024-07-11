import { FileUpload } from 'graphql-upload';

import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';

export type CustomCodeEngineServiceUpsertType = {
  sourceCodePath: string;
  builtSourcePath: string;
  lambdaName?: string;
};

export interface CustomCodeEngineDriver {
  execute(
    functionToExecute: FunctionWorkspaceEntity,
    event: object | undefined,
    context: object | undefined,
  ): Promise<object>;
  upsert(file: FileUpload): Promise<CustomCodeEngineServiceUpsertType>;
}
