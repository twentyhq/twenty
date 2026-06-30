import { type WorkflowBulkRecordsTrigger } from 'src/types/workflow-bulk-records-trigger';

export const buildBulkRecordsTrigger = ({
  objectNameSingular,
  name,
  icon,
}: {
  objectNameSingular: string;
  name: string;
  icon: string;
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
  nextStepIds: [],
});
