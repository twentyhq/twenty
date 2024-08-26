import { Edge, Node } from '@xyflow/react';

export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge;

export type WorkflowDiagram = {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagramStepNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export type WorkflowDiagramCreateStepNodeData = Record<string, never>;

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData;
