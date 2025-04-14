import {
  WorkflowActionType,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { Edge, Node } from '@xyflow/react';

export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge;

export type WorkflowRunDiagramNode = Node<WorkflowRunDiagramNodeData>;
export type WorkflowRunDiagramEdge = Edge;

export type WorkflowRunDiagram = {
  nodes: Array<WorkflowRunDiagramNode>;
  edges: Array<WorkflowRunDiagramEdge>;
};

export type WorkflowDiagram = {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagramRunStatus =
  | 'running'
  | 'success'
  | 'failure'
  | 'not-executed';

export type WorkflowDiagramStepNodeData =
  | {
      nodeType: 'trigger';
      triggerType: WorkflowTriggerType;
      name: string;
      icon?: string;
      runStatus?: WorkflowDiagramRunStatus;
    }
  | {
      nodeType: 'action';
      actionType: WorkflowActionType;
      name: string;
      runStatus?: WorkflowDiagramRunStatus;
    };

export type WorkflowRunDiagramStepNodeData = Exclude<
  WorkflowDiagramStepNodeData,
  'runStatus'
> & {
  runStatus: WorkflowDiagramRunStatus;
};

export type WorkflowDiagramCreateStepNodeData = {
  nodeType: 'create-step';
  parentNodeId: string;
};

export type WorkflowDiagramEmptyTriggerNodeData = {
  nodeType: 'empty-trigger';
};

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData
  | WorkflowDiagramEmptyTriggerNodeData;

export type WorkflowRunDiagramNodeData = Exclude<
  WorkflowDiagramStepNodeData,
  'runStatus'
> & { runStatus: WorkflowDiagramRunStatus };

export type WorkflowDiagramNodeType =
  | 'default'
  | 'empty-trigger'
  | 'create-step';

export type WorkflowDiagramEdgeType = 'default' | 'success';
