// Version jsonb as builders of every age wrote it, wider than the typed trigger and step definitions
export type StoredWorkflowErrorHandlingOptions = {
  retryOnFailure: { value: number | boolean };
  continueOnFailure: { value: boolean };
};

export type StoredWorkflowNodeSettings = {
  objectType?: string;
  errorHandlingOptions?: StoredWorkflowErrorHandlingOptions;
} & Record<string, unknown>;

export type StoredWorkflowNode = {
  type: string;
  valid?: boolean;
  position?: ({ x: number; y: number } & Record<string, unknown>) | null;
  nextStepIds?: string[] | null;
  settings?: StoredWorkflowNodeSettings;
} & Record<string, unknown>;

export type StoredWorkflowVersionDefinition = {
  triggers?: StoredWorkflowNode[] | null;
  steps?: StoredWorkflowNode[] | null;
};
