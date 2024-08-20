import { Edge, Node } from '@xyflow/react';
import { WorkflowDiagramNodeData } from '~/pages/workflows/nodes/base';

type WorkflowBaseSettingsType = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeSettingsType = WorkflowBaseSettingsType & {
  serverlessFunctionId: string;
};

export enum WorkflowActionType {
  CODE = 'CODE',
}

type CommonWorkflowAction = {
  name: string;
  displayName: string;
  valid: boolean;
};

type WorkflowCodeAction = CommonWorkflowAction & {
  type: WorkflowActionType.CODE;
  settings: WorkflowCodeSettingsType;
};

export type WorkflowAction = WorkflowCodeAction & {
  nextAction?: WorkflowAction;
};

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
}

type BaseTrigger = {
  type: WorkflowTriggerType;
  input?: object;
  nextAction?: WorkflowAction;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: WorkflowTriggerType.DATABASE_EVENT;
  settings: {
    eventName: string;
    triggerName: string;
  };
};

export type WorkflowTrigger = WorkflowDatabaseEventTrigger;

export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  trigger: WorkflowTrigger;
  __typename: 'WorkflowVersion';
};

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  publishedVersionId: string;
};

export type WorkflowDiagram = {
  nodes: Array<Node<WorkflowDiagramNodeData>>;
  edges: Array<Edge>;
};
