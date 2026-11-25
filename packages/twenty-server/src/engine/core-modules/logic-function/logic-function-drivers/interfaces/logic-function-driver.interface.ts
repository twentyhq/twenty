import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  type BrowserTranspileParams,
  type BrowserTranspileResult,
  type BrowserDependenciesBuildParams,
  type BrowserDependenciesBuildResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/types/transpile.type';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { type LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import {
  type LogicFunctionExecutionMode,
  type LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type ExecutableFlatLogicFunction } from 'src/engine/core-modules/logic-function/logic-function-drivers/types/executable-flat-logic-function.type';

export type LogicFunctionExecuteError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string | string[];
};

export type LogicFunctionExecuteResult = {
  data: object | null;
  duration: number;
  billedDurationMs: number;
  logs: string;
  status: LogicFunctionExecutionStatus;
  error?: LogicFunctionExecuteError;
};

export type LogicFunctionExecuteParams = {
  flatLogicFunction: ExecutableFlatLogicFunction;
  flatApplication: FlatApplication;
  payload: object;
  context: LogicFunctionExecutionContext;
  env?: Record<string, string>;
  timeoutMs?: number;
  forceExecutionMode?: LogicFunctionExecutionMode;
};

export type LogicFunctionInstallPrebuiltBundleParams = {
  flatLogicFunction: ExecutableFlatLogicFunction;
  flatApplication: FlatApplication;
};

export type LogicFunctionWarmUpParams = {
  flatLogicFunction: Pick<
    ExecutableFlatLogicFunction,
    'id' | 'executorNamePrefix'
  >;
  env?: Record<string, string>;
};

export type LogicFunctionTranspileParams = {
  targetRuntime: LogicFunctionRuntime;
  sourceCode: string;
  sourceFileName: string;
  builtFileName: string;
};

export type LogicFunctionTranspileResult = {
  builtCode: string;
};

export type LogicFunctionDeleteApplicationResourcesParams = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

export interface LogicFunctionDriver {
  delete(flatLogicFunction: ExecutableFlatLogicFunction): Promise<void>;
  deleteApplicationResources(
    params: LogicFunctionDeleteApplicationResourcesParams,
  ): Promise<void>;
  execute(
    params: LogicFunctionExecuteParams,
  ): Promise<LogicFunctionExecuteResult>;
  transpile(
    params: LogicFunctionTranspileParams,
  ): Promise<LogicFunctionTranspileResult>;
  transpile(params: BrowserTranspileParams): Promise<BrowserTranspileResult>;
  buildDependencies(
    params: BrowserDependenciesBuildParams,
  ): Promise<BrowserDependenciesBuildResult>;
  installPrebuiltBundle(
    params: LogicFunctionInstallPrebuiltBundleParams,
  ): Promise<void>;
  getInstalledBundleChecksum(
    flatLogicFunction: ExecutableFlatLogicFunction,
  ): Promise<string | null>;
  warmUp(params: LogicFunctionWarmUpParams): Promise<void>;
  executeHttpRequest(request: HttpEgressRequest): Promise<HttpEgressResponse>;
}

export enum LogicFunctionDriverType {
  DISABLED = 'DISABLED',
  LAMBDA = 'LAMBDA',
  LOCAL = 'LOCAL',
}
