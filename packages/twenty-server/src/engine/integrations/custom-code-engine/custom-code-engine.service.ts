import { Inject, Injectable } from '@nestjs/common';

import { FileUpload } from 'graphql-upload';

import { CustomCodeEngineDriver } from 'src/engine/integrations/custom-code-engine/drivers/interfaces/custom-code-engine-driver.interface';

import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';
import { CUSTOM_CODE_ENGINE_DRIVER } from 'src/engine/integrations/custom-code-engine/custom-code-engine.constants';

@Injectable()
export class CustomCodeEngineService implements CustomCodeEngineDriver {
  constructor(
    @Inject(CUSTOM_CODE_ENGINE_DRIVER) private driver: CustomCodeEngineDriver,
  ) {}

  async upsert(file: FileUpload) {
    return this.driver.upsert(file);
  }

  async execute(
    functionToExecute: FunctionWorkspaceEntity,
    event: object | undefined = undefined,
    context: object | undefined = undefined,
  ) {
    return this.driver.execute(functionToExecute, event, context);
  }
}
