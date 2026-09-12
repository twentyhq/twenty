import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useHydrateSelectedWorkflowRecords = (
  selectedWorkspaceWorkflowIds: string[],
) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const handleCompleted = useCallback(
    (records: ObjectRecord[]) => {
      upsertRecordsInStore({ partialRecords: records });
    },
    [upsertRecordsInStore],
  );

  useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    filter: { id: { in: selectedWorkspaceWorkflowIds } },
    limit: Math.max(selectedWorkspaceWorkflowIds.length, 1),
    skip: selectedWorkspaceWorkflowIds.length === 0,
    onCompleted: handleCompleted,
  });
};
