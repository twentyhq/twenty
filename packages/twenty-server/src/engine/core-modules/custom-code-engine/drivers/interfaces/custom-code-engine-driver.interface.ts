import { FileUpload } from 'graphql-upload';

import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

export type CustomCodeEngineServiceUpsertType = {
  sourceCodePath: string;
  buildSourcePath: string;
};

export interface CustomCodeEngineDriver {
  execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined,
  ): Promise<object>;
  generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ): Promise<CustomCodeEngineServiceUpsertType>;
}
