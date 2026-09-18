import { useCallback } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { doesObjectRecordOperationTargetRecordId } from '@/object-core/utils/doesObjectRecordOperationTargetRecordId';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

const WORKSPACE_RECORD_LIFECYCLE_OPERATION_TYPES = [
  'delete-one',
  'delete-many',
  'restore-one',
  'restore-many',
] satisfies ObjectRecordOperation['type'][];

export const useRefetchCoreRecordOnWorkspaceRecordLifecycleChange = ({
  objectNameSingular,
  recordId,
  refetch,
}: {
  objectNameSingular: string;
  recordId: string;
  refetch: () => void;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const handleObjectRecordOperationBrowserEvent = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (!doesObjectRecordOperationTargetRecordId({ operation, recordId })) {
        return;
      }

      refetch();
    },
    [recordId, refetch],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent:
      handleObjectRecordOperationBrowserEvent,
    objectMetadataItemId: objectMetadataItem.id,
    operationTypes: WORKSPACE_RECORD_LIFECYCLE_OPERATION_TYPES,
  });
};
