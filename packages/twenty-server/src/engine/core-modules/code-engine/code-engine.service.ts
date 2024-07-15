import { Inject, Injectable } from '@nestjs/common';

import { FileUpload } from 'graphql-upload';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';

import { CODE_ENGINE_DRIVER } from 'src/engine/core-modules/code-engine/code-engine.constants';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

@Injectable()
export class CodeEngineService implements CodeEngineDriver {
  constructor(@Inject(CODE_ENGINE_DRIVER) private driver: CodeEngineDriver) {}

  async generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ) {
    return this.driver.generateExecutable(name, workspaceId, file);
  }

  async execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined = undefined,
  ) {
    return this.driver.execute(functionToExecute, payload);
  }
}
