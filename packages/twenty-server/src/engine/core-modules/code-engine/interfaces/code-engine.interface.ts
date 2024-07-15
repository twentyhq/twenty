import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { LocalDriverOptions } from 'src/engine/core-modules/code-engine/drivers/local.driver';
import { LambdaDriverOptions } from 'src/engine/core-modules/code-engine/drivers/lambda.driver';

export enum CodeEngineDriverType {
  Lambda = 'lambda',
  Local = 'local',
}

export interface LocalDriverFactoryOptions {
  type: CodeEngineDriverType.Local;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: CodeEngineDriverType.Lambda;
  options: LambdaDriverOptions;
}

export type CodeEngineModuleOptions =
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type CodeEngineModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => CodeEngineModuleOptions | Promise<CodeEngineModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
