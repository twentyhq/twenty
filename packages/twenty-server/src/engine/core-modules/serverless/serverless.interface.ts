import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { LocalDriverOptions } from 'src/engine/core-modules/serverless/drivers/local.driver';
import { LambdaDriverOptions } from 'src/engine/core-modules/serverless/drivers/lambda.driver';

export enum ServerlessDriverType {
  Lambda = 'lambda',
  Local = 'local',
}

export interface LocalDriverFactoryOptions {
  type: ServerlessDriverType.Local;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: ServerlessDriverType.Lambda;
  options: LambdaDriverOptions;
}

export type ServerlessModuleOptions =
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type ServerlessModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => ServerlessModuleOptions | Promise<ServerlessModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
