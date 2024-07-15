import { Inject, Injectable } from '@nestjs/common';

import { FileUpload } from 'graphql-upload';

import { CustomCodeEngineDriver } from 'src/engine/integrations/custom-code-engine/drivers/interfaces/custom-code-engine-driver.interface';

import { CUSTOM_CODE_ENGINE_DRIVER } from 'src/engine/integrations/custom-code-engine/custom-code-engine.constants';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

@Injectable()
export class CustomCodeEngineService implements CustomCodeEngineDriver {
  constructor(
    @Inject(CUSTOM_CODE_ENGINE_DRIVER) private driver: CustomCodeEngineDriver,
  ) {}

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
