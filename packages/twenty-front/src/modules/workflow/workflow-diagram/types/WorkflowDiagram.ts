import {
  WorkflowActionType,
  WorkflowRunStepStatus,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { Edge, Node } from '@xyflow/react';
import { StepStatus } from 'twenty-shared/workflow';

export type WorkflowDiagramStepNode = Node<WorkflowDiagramStepNodeData>;
export type WorkflowDiagramNode = Node<WorkflowDiagramNodeData>;
export type WorkflowDiagramEdge = Edge<WorkflowDiagramEdgeData>;

export type WorkflowRunDiagramNode = Node<WorkflowRunDiagramNodeData>;

export type WorkflowRunDiagram = {
  nodes: Array<WorkflowRunDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
};

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
      runStatus?: WorkflowRunStepStatus;
      hasNextStepIds: boolean;
      stepId: string;
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
> & { runStatus: WorkflowRunStepStatus };

export type WorkflowDiagramFilterEdgeData = {
  edgeType: 'filter';
  stepId: string;
  filterSettings: FilterSettings;
  name: string;
  runStatus?: WorkflowRunStepStatus;
  edgeExecutionStatus?: StepStatus;
};

export type WorkflowDiagramDefaultEdgeData = {
  edgeType: 'default';
  edgeExecutionStatus?: StepStatus;
};

export type WorkflowDiagramEdgeData =
  | WorkflowDiagramFilterEdgeData
  | WorkflowDiagramDefaultEdgeData;

export type WorkflowDiagramNodeType =
  | 'default'
  | 'empty-trigger'
  | 'create-step';

export type WorkflowDiagramEdgeType =
  | 'blank'
  | 'filtering-disabled--editable'
  | 'filtering-disabled--readonly'
  | 'filtering-disabled--run'
  | 'empty-filter--editable'
  | 'empty-filter--readonly'
  | 'empty-filter--run'
  | 'filter--editable'
  | 'filter--readonly'
  | 'filter--run';
