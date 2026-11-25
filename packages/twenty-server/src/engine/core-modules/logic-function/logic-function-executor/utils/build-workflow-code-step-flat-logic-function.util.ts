import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { NON_PERSISTED_EXECUTOR_NAME_PREFIXES } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/non-persisted-executor-name-prefixes';
import { type ExecutableFlatLogicFunction } from 'src/engine/core-modules/logic-function/logic-function-drivers/types/executable-flat-logic-function.type';
import { getWorkflowCodeStepLogicFunctionId } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/get-workflow-code-step-logic-function-id.util';
import {
  DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const buildWorkflowCodeStepFlatLogicFunction = ({
  flatApplication,
  builtHandlerPath,
}: {
  flatApplication: Pick<
    FlatApplication,
    'id' | 'workspaceId' | 'universalIdentifier'
  >;
  builtHandlerPath: string;
}): ExecutableFlatLogicFunction => {
  const id = getWorkflowCodeStepLogicFunctionId({
    workspaceId: flatApplication.workspaceId,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  });
  const now = new Date().toISOString();

  return {
    id,
    executorNamePrefix: NON_PERSISTED_EXECUTOR_NAME_PREFIXES.WORKFLOW_CODE_STEP,
    universalIdentifier: id,
    workspaceId: flatApplication.workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    name: 'Code step',
    description: null,
    sourceHandlerPath: builtHandlerPath,
    builtHandlerPath,
    handlerName: 'main',
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
    jobFailureHandlerName: null,
    retryLimit: null,
    checksum: null,
    isBuildUpToDate: true,
    executionMode: LogicFunctionExecutionMode.LIVE,
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
    serverRouteTriggerSettings: null,
    toolTriggerSettings: null,
    workflowActionTriggerSettings: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
