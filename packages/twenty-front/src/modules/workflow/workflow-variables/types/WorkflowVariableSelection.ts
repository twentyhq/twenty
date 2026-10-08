export type WorkflowVariableStepSelection = {
  stepId: string;
  path?: string[];
};

export type WorkflowVariableSelection = {
  rawVariableName: string;
  stepId: string;
  isFullRecord: boolean;
};
