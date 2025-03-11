export const getStepOutputSchemaKey = (
  workflowVersionId: string,
  stepId: string,
) => `${workflowVersionId}-${stepId}`;
