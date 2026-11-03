import { v5 as uuidv5 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const WORKFLOW_CODE_STEP_LOGIC_FUNCTION_ID_NAMESPACE =
  '6f1d3b0e-6a43-4f7e-9c55-2b8f0d6c1a7e';

// Drivers key their executor on the logic function id: one shared executor per application
export const getWorkflowCodeStepLogicFunctionId = (applicationId: string) =>
  uuidv5(
    `workflow-code-step:${applicationId}`,
    WORKFLOW_CODE_STEP_LOGIC_FUNCTION_ID_NAMESPACE,
  );

export const buildWorkflowCodeStepFlatLogicFunction = ({
  flatApplication,
  builtHandlerPath,
}: {
  flatApplication: FlatApplication;
  builtHandlerPath: string;
}): FlatLogicFunction => {
  const id = getWorkflowCodeStepLogicFunctionId(flatApplication.id);
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
