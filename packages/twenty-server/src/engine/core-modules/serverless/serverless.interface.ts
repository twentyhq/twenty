import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

import { type LambdaDriverOptions } from 'src/engine/core-modules/serverless/drivers/lambda.driver';
import { type LocalDriverOptions } from 'src/engine/core-modules/serverless/drivers/local.driver';

export enum ServerlessDriverType {
  DISABLED = 'DISABLED',
  LAMBDA = 'LAMBDA',
  LOCAL = 'LOCAL',
}

export interface DisabledDriverFactoryOptions {
  type: ServerlessDriverType.DISABLED;
}

export interface LocalDriverFactoryOptions {
  type: ServerlessDriverType.LOCAL;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: ServerlessDriverType.LAMBDA;
  options: LambdaDriverOptions;
}

export type ServerlessModuleOptions =
  | DisabledDriverFactoryOptions
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type ServerlessModuleAsyncOptions = {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => ServerlessModuleOptions | Promise<ServerlessModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
