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

export type WorkflowActionType = 'CODE_ACTION';

type CommonWorkflowAction = {
  id: string;
  name: string;
  valid: boolean;
};

type WorkflowCodeAction = CommonWorkflowAction & {
  type: 'CODE_ACTION';
  settings: WorkflowCodeSettingsType;
};

export type WorkflowAction = WorkflowCodeAction;

export type WorkflowStep = WorkflowAction;

export type WorkflowTriggerType = 'DATABASE_EVENT';

type BaseTrigger = {
  type: WorkflowTriggerType;
  input?: object;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: 'DATABASE_EVENT';
  settings: {
    eventName: string;
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
  steps: Array<WorkflowStep>;
  __typename: 'WorkflowVersion';
};

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  publishedVersionId: string;
};
