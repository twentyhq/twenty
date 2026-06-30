export type SeedEnrichmentWorkflowResult = {
  objectNameSingular: string;
  workflowName: string;
  status: 'created' | 'skipped' | 'failed';
  workflowId?: string;
  error?: string;
};
