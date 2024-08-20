export type WorkflowDiagramStepNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export type WorkflowDiagramCreateStepNodeData = Record<string, never>;

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData;
