export type WorkflowVariableSearchResult = {
  stepId: string;
  path: string[];
  label: string;
  breadcrumb: string;
  icon?: string;
  isLeaf: boolean;
};
