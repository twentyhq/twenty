import { Edge, Node } from '@xyflow/react';

export type WorkflowDiagram = {
  nodes: Array<Node<WorkflowDiagramNodeData>>;
  edges: Array<Edge>;
};

export type WorkflowDiagramStepNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export type WorkflowDiagramCreateStepNodeData = Record<string, never>;

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData;
