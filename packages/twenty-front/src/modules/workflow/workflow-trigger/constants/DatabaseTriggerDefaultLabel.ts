import { WORKFLOW_TRIGGER_DEFAULT_NAMES } from 'twenty-shared/workflow';

export const DatabaseTriggerDefaultLabel = {
  RECORD_IS_CREATED: WORKFLOW_TRIGGER_DEFAULT_NAMES.DATABASE_EVENT.created,
  RECORD_IS_UPDATED: WORKFLOW_TRIGGER_DEFAULT_NAMES.DATABASE_EVENT.updated,
  RECORD_IS_DELETED: WORKFLOW_TRIGGER_DEFAULT_NAMES.DATABASE_EVENT.deleted,
  RECORD_UPSERTED: WORKFLOW_TRIGGER_DEFAULT_NAMES.DATABASE_EVENT.upserted,
} as const;

export type DatabaseTriggerDefaultLabel =
  (typeof DatabaseTriggerDefaultLabel)[keyof typeof DatabaseTriggerDefaultLabel];
