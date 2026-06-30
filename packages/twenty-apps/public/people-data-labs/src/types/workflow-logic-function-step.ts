export type WorkflowLogicFunctionStep = {
  id: string;
  name: string;
  type: 'LOGIC_FUNCTION';
  valid: boolean;
  settings: {
    input: {
      logicFunctionId: string;
      logicFunctionInput: Record<string, unknown>;
    };
    outputSchema: Record<string, never>;
    errorHandlingOptions: {
      retryOnFailure: { value: boolean };
      continueOnFailure: { value: boolean };
    };
  };
  nextStepIds: string[];
};
