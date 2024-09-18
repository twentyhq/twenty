import { Inject, Injectable } from '@nestjs/common';

import {
  ServerlessDriver,
  ServerlessExecuteResult,
} from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

import { SERVERLESS_DRIVER } from 'src/engine/core-modules/serverless/serverless.constants';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Injectable()
export class ServerlessService implements ServerlessDriver {
  constructor(@Inject(SERVERLESS_DRIVER) private driver: ServerlessDriver) {}

  async delete(serverlessFunction: ServerlessFunctionEntity): Promise<void> {
    return this.driver.delete(serverlessFunction);
  }

  async build(
    serverlessFunction: ServerlessFunctionEntity,
    version: string,
  ): Promise<void> {
    return this.driver.build(serverlessFunction, version);
  }

  async publish(serverlessFunction: ServerlessFunctionEntity): Promise<string> {
    return this.driver.publish(serverlessFunction);
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    return this.driver.execute(serverlessFunction, payload, version);
  }
}
