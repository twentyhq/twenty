import { Inject, Injectable } from '@nestjs/common';

import {
  ServerlessDriver,
  type ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { SERVERLESS_DRIVER } from 'src/engine/core-modules/serverless/serverless.constants';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Injectable()
export class ServerlessService implements ServerlessDriver {
  constructor(@Inject(SERVERLESS_DRIVER) private driver: ServerlessDriver) {}

  async delete(serverlessFunction: ServerlessFunctionEntity): Promise<void> {
    return this.driver.delete(serverlessFunction);
  }

  async execute({
    serverlessFunction,
    payload,
    version,
    env,
  }: {
    serverlessFunction: ServerlessFunctionEntity;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<ServerlessExecuteResult> {
    return this.driver.execute({ serverlessFunction, payload, version, env });
  }
}
