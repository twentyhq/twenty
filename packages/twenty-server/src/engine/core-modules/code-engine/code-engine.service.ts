import { Inject, Injectable } from '@nestjs/common';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';

import { CODE_ENGINE_DRIVER } from 'src/engine/core-modules/code-engine/code-engine.constants';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

@Injectable()
export class CodeEngineService implements CodeEngineDriver {
  constructor(@Inject(CODE_ENGINE_DRIVER) private driver: CodeEngineDriver) {}

  async build(functionMetadata: FunctionMetadataEntity): Promise<void> {
    return this.driver.build(functionMetadata);
  }

  async execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined = undefined,
  ) {
    return this.driver.execute(functionToExecute, payload);
  }
}
