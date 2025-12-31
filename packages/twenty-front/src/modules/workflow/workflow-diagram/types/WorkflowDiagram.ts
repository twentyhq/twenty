import {
  type WorkflowActionType,
  type WorkflowRunStepStatus,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { type MessageDescriptor } from '@lingui/core';
import {
  type Connection,
  type Edge,
  type Node,
  type Position,
} from '@xyflow/react';
import { type StepStatus } from 'twenty-shared/workflow';

export type WorkflowDiagramStepNode = Node<WorkflowDiagramStepNodeData>;
export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge<WorkflowDiagramEdgeData> & {
  sourceHandle: string;
  targetHandle: string;
};

export type WorkflowConnection = Connection & {
  sourceHandle: string;
  targetHandle: string;
};

export type WorkflowRunDiagramNode = Node<WorkflowRunDiagramNodeData>;

export type WorkflowRunDiagram = {
  nodes: Array<WorkflowRunDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagram = {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

export type WorkflowDiagramNodeRightHandleOptions = {
  id: string;
};

export type WorkflowDiagramNodeDefaultHandleOptions = {
  label?: MessageDescriptor;
};

export type WorkflowDiagramStepNodeData =
  | {
      nodeType: 'trigger';
      triggerType: WorkflowTriggerType;
      name: string;
      icon?: string;
      runStatus?: WorkflowRunStepStatus;
      hasNextStepIds: boolean;
      stepId: string;
      defaultHandleOptions?: WorkflowDiagramNodeDefaultHandleOptions;
      rightHandleOptions?: WorkflowDiagramNodeRightHandleOptions;
      position: {
        x: number;
        y: number;
      };
    }
  | {
      nodeType: 'action';
      actionType: WorkflowActionType;
      name: string;
      runStatus?: WorkflowRunStepStatus;
      hasNextStepIds: boolean;
      stepId: string;
      defaultHandleOptions?: WorkflowDiagramNodeDefaultHandleOptions;
      rightHandleOptions?: WorkflowDiagramNodeRightHandleOptions;
      position: {
        x: number;
        y: number;
      };
    };

export type WorkflowRunDiagramStepNodeData = Exclude<
  WorkflowDiagramStepNodeData,
  'runStatus'
> & {
  runStatus: WorkflowRunStepStatus;
};

export type WorkflowDiagramEmptyTriggerNodeData = {
  nodeType: 'empty-trigger';
  position: {
    x: number;
    y: number;
  };
};

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramEmptyTriggerNodeData;

export type WorkflowRunDiagramNodeData = Exclude<
  WorkflowDiagramStepNodeData,
  'runStatus'
> & { runStatus: WorkflowRunStepStatus };

export type WorkflowDiagramEdgeLabelOptions = {
  position: Position;
  label: MessageDescriptor;
};

export type WorkflowDiagramEdgePathStrategy =
  | 'smooth-step-path-to-target'
  | 'bypass-source-node-on-right-side';

export type WorkflowDiagramDefaultEdgeData = {
  edgeType: 'default';
  edgeExecutionStatus?: StepStatus;
  labelOptions?: WorkflowDiagramEdgeLabelOptions;
  edgePathStrategy?: WorkflowDiagramEdgePathStrategy;
};

export type WorkflowDiagramEdgeData = WorkflowDiagramDefaultEdgeData;

export type WorkflowDiagramNodeType = 'default' | 'empty-trigger' | 'empty';

export type WorkflowDiagramEdgeType = 'blank' | 'editable' | 'readonly';

export type StartNodeCreationParams = {
  parentStepId?: string;
  nextStepId?: string;
  position?: { x: number; y: number };
  connectionOptions?: WorkflowStepConnectionOptions;
};
