import { type WorkflowBulkRecordsTrigger } from 'src/types/workflow-bulk-records-trigger.type';

export const buildBulkRecordsTrigger = ({
  objectNameSingular,
  name,
  icon,
  nextStepId,
}: {
  objectNameSingular: string;
  name: string;
  icon: string;
  nextStepId: string;
}): WorkflowBulkRecordsTrigger => ({
  name,
  type: 'MANUAL',
  settings: {
    objectType: objectNameSingular,
    availability: {
      type: 'BULK_RECORDS',
      objectNameSingular,
    },
    outputSchema: {},
    icon,
    isPinned: false,
  },
  nextStepIds: [nextStepId],
});
