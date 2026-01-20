import { Inject, Injectable } from '@nestjs/common';

import {
  ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { SERVERLESS_DRIVER } from 'src/engine/core-modules/serverless/serverless.constants';
import { type FlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/types/flat-serverless-function-layer.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

@Injectable()
export class ServerlessService implements ServerlessDriver {
  constructor(@Inject(SERVERLESS_DRIVER) private driver: ServerlessDriver) {}

  async delete(flatServerlessFunction: FlatServerlessFunction): Promise<void> {
    return this.driver.delete(flatServerlessFunction);
  }

  async execute({
    flatServerlessFunction,
    flatServerlessFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatServerlessFunction: FlatServerlessFunction;
    flatServerlessFunctionLayer: FlatServerlessFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult> {
    return this.driver.execute({
      flatServerlessFunction,
      flatServerlessFunctionLayer,
      payload,
      version,
      env,
    });
  }
}
