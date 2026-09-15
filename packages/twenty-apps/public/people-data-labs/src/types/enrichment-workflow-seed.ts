export type EnrichmentWorkflowSeed = {
  objectNameSingular: string;
  workflowName: string;
  triggerName: string;
  icon: string;
  stepName: string;
  logicFunctionUniversalIdentifier: string;
  logicFunctionInput: Record<string, unknown>;
};
