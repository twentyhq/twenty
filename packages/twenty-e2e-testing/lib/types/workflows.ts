export type WorkflowTriggerType =
  | 'record-created'
  | 'record-updated'
  | 'record-deleted'
  | 'manual';

export type WorkflowActionType =
  | 'create-record'
  | 'update-record'
  | 'delete-record'
  | 'code'
  | 'send-email'
  | 'form';
