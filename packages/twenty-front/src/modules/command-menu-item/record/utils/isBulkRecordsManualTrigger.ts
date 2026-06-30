import { type WorkflowTrigger } from '@/workflow/types/Workflow';

export const isBulkRecordsManualTrigger = (trigger: WorkflowTrigger) => {
  return (
    trigger.type === 'MANUAL' &&
    trigger?.settings?.availability?.type === 'BULK_RECORDS'
  );
};
