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

export type WorkflowActionType = 'CODE';

type CommonWorkflowAction = {
  name: string;
  displayName: string;
  valid: boolean;
};

type WorkflowCodeAction = CommonWorkflowAction & {
  type: 'CODE';
  settings: WorkflowCodeSettingsType;
};

export type WorkflowAction = WorkflowCodeAction & {
  nextAction?: WorkflowAction;
};

export type WorkflowTriggerType = 'DATABASE_EVENT';

type BaseTrigger = {
  type: WorkflowTriggerType;
  input?: object;
  nextAction?: WorkflowAction;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: 'DATABASE_EVENT';
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
