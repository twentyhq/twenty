import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';
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

export interface LogicFunctionExecutorDriver {
  delete(flatLogicFunction: FlatLogicFunction): Promise<void>;
  execute({
    flatLogicFunction,
    flatLogicFunctionLayer,
    payload,
    version,
    env,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatLogicFunctionLayer: FlatLogicFunctionLayer;
    payload: object;
    version: string;
    env?: Record<string, string>;
  }): Promise<LogicFunctionExecuteResult>;
}
