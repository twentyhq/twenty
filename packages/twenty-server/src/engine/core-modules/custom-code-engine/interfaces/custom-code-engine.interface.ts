import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { LocalDriverOptions } from 'src/engine/core-modules/custom-code-engine/drivers/local.driver';
import { LambdaDriverOptions } from 'src/engine/core-modules/custom-code-engine/drivers/lambda.driver';

export enum CustomCodeEngineDriverType {
  Lambda = 'lambda',
  Local = 'local',
}

export interface LocalDriverFactoryOptions {
  type: CustomCodeEngineDriverType.Local;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: CustomCodeEngineDriverType.Lambda;
  options: LambdaDriverOptions;
}

export type CustomCodeEngineModuleOptions =
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type CustomCodeEngineModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => CustomCodeEngineModuleOptions | Promise<CustomCodeEngineModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
