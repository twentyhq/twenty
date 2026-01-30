import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

import { type E2BDriverOptions } from './drivers/e2b.driver';
import { type LocalDriverOptions } from './drivers/local.driver';

export enum CodeInterpreterDriverType {
  LOCAL = 'LOCAL',
  E_2_B = 'E_2_B',
  DISABLED = 'DISABLED',
}

export type LocalDriverFactoryOptions = {
  type: CodeInterpreterDriverType.LOCAL;
  options: LocalDriverOptions;
};

export type E2BDriverFactoryOptions = {
  type: CodeInterpreterDriverType.E_2_B;
  options: E2BDriverOptions;
};

export type DisabledDriverFactoryOptions = {
  type: CodeInterpreterDriverType.DISABLED;
  options: { reason: string };
};

export type CodeInterpreterModuleOptions =
  | LocalDriverFactoryOptions
  | E2BDriverFactoryOptions
  | DisabledDriverFactoryOptions;

export type CodeInterpreterModuleAsyncOptions = {
  useFactory: (
    ...args: unknown[]
  ) => CodeInterpreterModuleOptions | Promise<CodeInterpreterModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
