import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

import { type E2BDriverOptions } from './drivers/e2b.driver';
import { type LocalDriverOptions } from './drivers/local.driver';

export enum CodeInterpreterDriverType {
  LOCAL = 'LOCAL',
  E2B = 'E2B',
}

export type LocalDriverFactoryOptions = {
  type: CodeInterpreterDriverType.LOCAL;
  options: LocalDriverOptions;
};

export type E2BDriverFactoryOptions = {
  type: CodeInterpreterDriverType.E2B;
  options: E2BDriverOptions;
};

export type CodeInterpreterModuleOptions =
  | LocalDriverFactoryOptions
  | E2BDriverFactoryOptions;

export type CodeInterpreterModuleAsyncOptions = {
  useFactory: (
    ...args: unknown[]
  ) => CodeInterpreterModuleOptions | Promise<CodeInterpreterModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

