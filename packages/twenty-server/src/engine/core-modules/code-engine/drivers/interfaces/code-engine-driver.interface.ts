import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

export interface CodeEngineDriver {
  build(functionMetadata: FunctionMetadataEntity): Promise<void>;
  execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined,
  ): Promise<object>;
}
