import { FileUpload } from 'graphql-upload';

import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

export type CodeEngineServiceUpsertType = {
  sourceCodePath: string;
  buildSourcePath: string;
};

export interface CodeEngineDriver {
  execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined,
  ): Promise<object>;
  generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ): Promise<CodeEngineServiceUpsertType>;
}
