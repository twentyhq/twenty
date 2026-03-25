import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

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
  timeoutMs?: number;
};

export type LogicFunctionTranspileParams = {
  sourceCode: string;
  sourceFileName: string;
  builtFileName: string;
};

export type LogicFunctionTranspileResult = {
  builtCode: string;
};

export interface LogicFunctionDriver {
  delete(flatLogicFunction: FlatLogicFunction): Promise<void>;
  execute(
    params: LogicFunctionExecuteParams,
  ): Promise<LogicFunctionExecuteResult>;
  transpile(
    params: LogicFunctionTranspileParams,
  ): Promise<LogicFunctionTranspileResult>;
}

export enum LogicFunctionDriverType {
  DISABLED = 'DISABLED',
  LAMBDA = 'LAMBDA',
  LOCAL = 'LOCAL',
}
