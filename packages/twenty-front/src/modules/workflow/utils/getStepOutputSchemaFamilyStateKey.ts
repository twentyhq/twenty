export const getStepOutputSchemaFamilyStateKey = (
  workflowVersionId: string,
  stepId: string,
) => `${workflowVersionId}-${stepId}`;
