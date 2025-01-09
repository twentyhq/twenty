type BaseWorkflowActionSettings = {
  input: object;
  outputSchema: object;
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeActionSettings = BaseWorkflowActionSettings & {
  input: {
    serverlessFunctionId: string;
    serverlessFunctionVersion: string;
    serverlessFunctionInput: {
      [key: string]: any;
    };
  };
};

export type WorkflowSendEmailActionSettings = BaseWorkflowActionSettings & {
  input: {
    connectedAccountId: string;
    email: string;
    subject?: string;
    body?: string;
  };
};

type ObjectRecord = Record<string, any>;

export type WorkflowCreateRecordActionSettings = BaseWorkflowActionSettings & {
  input: {
    objectName: string;
    objectRecord: ObjectRecord;
  };
};

export type WorkflowUpdateRecordActionSettings = BaseWorkflowActionSettings & {
  input: {
    objectName: string;
    objectRecord: ObjectRecord;
    objectRecordId: string;
    fieldsToUpdate: string[];
  };
};

export type WorkflowDeleteRecordActionSettings = BaseWorkflowActionSettings & {
  input: {
    objectName: string;
    objectRecordId: string;
  };
};

type BaseWorkflowAction = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeAction = BaseWorkflowAction & {
  type: 'CODE';
  settings: WorkflowCodeActionSettings;
};

export type WorkflowSendEmailAction = BaseWorkflowAction & {
  type: 'SEND_EMAIL';
  settings: WorkflowSendEmailActionSettings;
};

export type WorkflowCreateRecordAction = BaseWorkflowAction & {
  type: 'CREATE_RECORD';
  settings: WorkflowCreateRecordActionSettings;
};

export type WorkflowUpdateRecordAction = BaseWorkflowAction & {
  type: 'UPDATE_RECORD';
  settings: WorkflowUpdateRecordActionSettings;
};

export type WorkflowDeleteRecordAction = BaseWorkflowAction & {
  type: 'DELETE_RECORD';
  settings: WorkflowDeleteRecordActionSettings;
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction;

export type WorkflowActionType = WorkflowAction['type'];

export type WorkflowStep = WorkflowAction;

export type WorkflowStepType = WorkflowStep['type'];

type BaseTrigger = {
  name?: string;
  type: string;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: 'DATABASE_EVENT';
  settings: {
    eventName: string;
    input?: object;
    outputSchema: object;
    objectType?: string;
  };
};

export type WorkflowManualTrigger = BaseTrigger & {
  type: 'MANUAL';
  settings: {
    objectType?: string;
    outputSchema: object;
  };
};

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];

export type WorkflowManualTriggerAvailability =
  | 'EVERYWHERE'
  | 'WHEN_RECORD_SELECTED';

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger;

export type WorkflowTriggerType = WorkflowTrigger['type'];

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED';

export type WorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowStep> | null;
  status: WorkflowVersionStatus;
  __typename: 'WorkflowVersion';
};

type StepRunOutput = {
  id: string;
  name: string;
  type: string;
  outputs: {
    attemptCount: number;
    result: object | undefined;
    error: string | undefined;
  }[];
};

export type WorkflowRunOutput = {
  steps: Record<string, StepRunOutput>;
  error?: string;
};

export type WorkflowRun = {
  __typename: 'WorkflowRun';
  id: string;
  workflowVersionId: string;
  output: WorkflowRunOutput;
};

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  lastPublishedVersionId: string;
  statuses: Array<WorkflowStatus> | null;
};

export type WorkflowWithCurrentVersion = Workflow & {
  currentVersion: WorkflowVersion;
};
