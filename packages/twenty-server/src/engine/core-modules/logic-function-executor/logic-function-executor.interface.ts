import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function-executor/drivers/lambda.driver';
import { type LocalDriverOptions } from 'src/engine/core-modules/logic-function-executor/drivers/local.driver';

export enum LogicFunctionExecutorDriverType {
  DISABLED = 'DISABLED',
  LAMBDA = 'LAMBDA',
  LOCAL = 'LOCAL',
}

export interface DisabledDriverFactoryOptions {
  type: LogicFunctionExecutorDriverType.DISABLED;
}

export interface LocalDriverFactoryOptions {
  type: LogicFunctionExecutorDriverType.LOCAL;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: LogicFunctionExecutorDriverType.LAMBDA;
  options: LambdaDriverOptions;
}

export type LogicFunctionExecutorModuleOptions =
  | DisabledDriverFactoryOptions
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type LogicFunctionExecutorModuleAsyncOptions = {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) =>
    | LogicFunctionExecutorModuleOptions
    | Promise<LogicFunctionExecutorModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
