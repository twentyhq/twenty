import { type WorkflowLogicFunctionStep } from 'src/types/workflow-logic-function-step';

export const buildLogicFunctionStep = ({
  id,
  name,
  logicFunctionId,
  logicFunctionInput,
}: {
  id: string;
  name: string;
  logicFunctionId: string;
  logicFunctionInput: Record<string, unknown>;
}): WorkflowLogicFunctionStep => ({
  id,
  name,
  type: 'LOGIC_FUNCTION',
  valid: true,
  settings: {
    input: {
      logicFunctionId,
      logicFunctionInput,
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds: [],
});
