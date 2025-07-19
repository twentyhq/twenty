import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { KeyWrappingStrategy } from 'src/engine/core-modules/encryption/keys/wrapping/enums/key-wrapping-strategies.enum';

export interface KeyWrappingModuleOptions {
  type: KeyWrappingStrategy;
}

export type KeyWrappingModuleAsyncOptions = {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => KeyWrappingModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
