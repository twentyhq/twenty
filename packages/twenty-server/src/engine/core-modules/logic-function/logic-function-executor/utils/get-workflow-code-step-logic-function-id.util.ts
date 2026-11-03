import { v5 as uuidv5 } from 'uuid';

const WORKFLOW_CODE_STEP_LOGIC_FUNCTION_ID_NAMESPACE =
  '6f1d3b0e-6a43-4f7e-9c55-2b8f0d6c1a7e';

// Drivers key their executor on the logic function id: one shared executor per application
export const getWorkflowCodeStepLogicFunctionId = (applicationId: string) =>
  uuidv5(
    `workflow-code-step:${applicationId}`,
    WORKFLOW_CODE_STEP_LOGIC_FUNCTION_ID_NAMESPACE,
  );
