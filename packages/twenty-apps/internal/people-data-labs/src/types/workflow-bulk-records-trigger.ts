export type WorkflowBulkRecordsTrigger = {
  name: string;
  type: 'MANUAL';
  settings: {
    objectType: string;
    availability: {
      type: 'BULK_RECORDS';
      objectNameSingular: string;
    };
    outputSchema: Record<string, never>;
    icon: string;
    isPinned: boolean;
  };
  nextStepIds: string[];
};
