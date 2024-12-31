import {
  WorkflowActionType,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { Edge, Node } from '@xyflow/react';

export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge;

export type WorkflowDiagram = {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagramStepNodeData =
  | {
      nodeType: 'trigger';
      triggerType: WorkflowTriggerType;
      name: string;
    }
  | {
      nodeType: 'action';
      actionType: WorkflowActionType;
      name: string;
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
