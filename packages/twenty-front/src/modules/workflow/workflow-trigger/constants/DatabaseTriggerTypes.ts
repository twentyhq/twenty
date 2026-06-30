import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { type DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { RECORD_IS_CREATED_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/RecordIsCreatedTrigger';
import { RECORD_IS_DELETED_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/RecordIsDeletedTrigger';
import { RECORD_IS_UPDATED_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/RecordIsUpdatedTrigger';
import { RECORD_UPSERTED_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/RecordUpsertedTrigger';

export const DATABASE_TRIGGER_TYPES: Array<{
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
}> = [
  RECORD_IS_CREATED_TRIGGER,
  RECORD_IS_UPDATED_TRIGGER,
  RECORD_IS_DELETED_TRIGGER,
  RECORD_UPSERTED_TRIGGER,
];
