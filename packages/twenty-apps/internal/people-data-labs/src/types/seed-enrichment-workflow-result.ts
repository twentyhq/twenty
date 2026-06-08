export type SeedEnrichmentWorkflowResult = {
  objectNameSingular: string;
  workflowName: string;
  status: 'created' | 'skipped';
  workflowId?: string;
};
