import { WorkflowActionType } from '@/workflow/types/Workflow';
import { Edge, Node } from '@xyflow/react';

export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge;

export type WorkflowDiagram = {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagramStepNodeData =
  | {
      nodeType: 'trigger' | 'condition';
      label: string;
    }
  | {
      nodeType: 'action';
      actionType: WorkflowActionType;
      label: string;
    };

export type WorkflowDiagramCreateStepNodeData = {
  nodeType: 'create-step';
  parentNodeId: string;
};

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData;

export type WorkflowDiagramNodeType =
  | 'default'
  | 'empty-trigger'
  | 'create-step';
