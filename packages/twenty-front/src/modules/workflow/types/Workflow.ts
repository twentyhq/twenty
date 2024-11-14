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

export type WorkflowCreateRecordActionInput = {
  type: 'CREATE';
  objectName: string;
  objectRecord: ObjectRecord;
};

export type WorkflowUpdateRecordActionInput = {
  type: 'UPDATE';
  objectName: string;
  objectRecord: ObjectRecord;
  objectRecordId: string;
};

export type WorkflowDeleteRecordActionInput = {
  type: 'DELETE';
  objectName: string;
  objectRecordId: string;
};

export type WorkflowRecordCRUDActionInput =
  | WorkflowCreateRecordActionInput
  | WorkflowUpdateRecordActionInput
  | WorkflowDeleteRecordActionInput;

export type WorkflowRecordCRUDType = WorkflowRecordCRUDActionInput['type'];

export type WorkflowRecordCRUDActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowRecordCRUDActionInput;
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

export type WorkflowRecordCRUDAction = BaseWorkflowAction & {
  type: 'RECORD_CRUD';
  settings: WorkflowRecordCRUDActionSettings;
};

export type WorkflowRecordCreateAction = WorkflowRecordCRUDAction & {
  settings: { input: { type: 'CREATE' } };
};

export type WorkflowRecordUpdateAction = WorkflowRecordCRUDAction & {
  settings: { input: { type: 'UPDATE' } };
};

export type WorkflowRecordDeleteAction = WorkflowRecordCRUDAction & {
  settings: { input: { type: 'DELETE' } };
};

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowRecordCRUDAction;

export type WorkflowStep = WorkflowAction;

export type WorkflowActionType =
  | Exclude<WorkflowAction['type'], WorkflowRecordCRUDAction['type']>
  | `${WorkflowRecordCRUDAction['type']}.${WorkflowRecordCRUDType}`;

export type WorkflowStepType = WorkflowActionType;

type BaseTrigger = {
  type: string;
  input?: object;
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
