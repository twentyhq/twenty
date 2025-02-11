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
      icon?: string;
      isLeafNode: boolean;
    }
  | {
      nodeType: 'action';
      actionType: WorkflowActionType;
      name: string;
      isLeafNode: boolean;
    };

export type WorkflowDiagramCreateStepNodeData = {
  nodeType: 'create-step';
  parentNodeId: string;
  isLeafNode?: never;
};

export type WorkflowDiagramEmptyTriggerNodeData = {
  nodeType: 'empty-trigger';
  isLeafNode: boolean;
};

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData
  | WorkflowDiagramEmptyTriggerNodeData;

export type WorkflowDiagramNodeType =
  | 'default'
  | 'empty-trigger'
  | 'create-step';

export type WorkflowDiagramEdgeType = 'default' | 'success';
