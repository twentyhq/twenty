export type SeedEnrichmentWorkflowResult = {
  objectNameSingular: string;
  workflowName: string;
  status: 'created' | 'skipped' | 'failed';
  coreWorkflowId?: string;
  error?: string;
};
