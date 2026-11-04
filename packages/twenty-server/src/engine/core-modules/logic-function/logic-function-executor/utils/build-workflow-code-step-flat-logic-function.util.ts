import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getWorkflowCodeStepLogicFunctionId } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/get-workflow-code-step-logic-function-id.util';
import {
  DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const buildWorkflowCodeStepFlatLogicFunction = ({
  flatApplication,
  builtHandlerPath,
}: {
  flatApplication: Pick<
    FlatApplication,
    'id' | 'workspaceId' | 'universalIdentifier'
  >;
  builtHandlerPath: string;
}): FlatLogicFunction => {
  const id = getWorkflowCodeStepLogicFunctionId({
    workspaceId: flatApplication.workspaceId,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  });
  const now = new Date().toISOString();

  return {
    id,
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
