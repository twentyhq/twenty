import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import type { LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import type { LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';

export type LogicFunctionExecuteError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string | string[];
};

export type LogicFunctionExecuteResult = {
  data: object | null;
  duration: number;
  logs: string;
  status: LogicFunctionExecutionStatus;
  error?: LogicFunctionExecuteError;
};

export type LogicFunctionExecuteParams = {
  flatLogicFunction: FlatLogicFunction;
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
  payload: object;
  env?: Record<string, string>;
};

export interface LogicFunctionDriver {
  delete(flatLogicFunction: FlatLogicFunction): Promise<void>;
  execute(
    params: LogicFunctionExecuteParams,
  ): Promise<LogicFunctionExecuteResult>;
}

export enum LogicFunctionDriverType {
  DISABLED = 'DISABLED',
  LAMBDA = 'LAMBDA',
  LOCAL = 'LOCAL',
}

export interface DisabledDriverFactoryOptions {
  type: LogicFunctionDriverType.DISABLED;
}

export interface LocalDriverFactoryOptions {
  type: LogicFunctionDriverType.LOCAL;
  options: LocalDriverOptions;
}

export interface LambdaDriverFactoryOptions {
  type: LogicFunctionDriverType.LAMBDA;
  options: LambdaDriverOptions;
}

export type LogicFunctionModuleOptions =
  | DisabledDriverFactoryOptions
  | LocalDriverFactoryOptions
  | LambdaDriverFactoryOptions;

export type LogicFunctionModuleAsyncOptions = {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => LogicFunctionModuleOptions | Promise<LogicFunctionModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
