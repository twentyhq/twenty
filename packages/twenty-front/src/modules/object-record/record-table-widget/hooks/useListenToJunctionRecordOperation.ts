import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Junction records are written on another object than the one the table lists.
export const useListenToJunctionRecordOperation = ({
  onJunctionRecordOperation,
}: {
  onJunctionRecordOperation: () => void;
}) => {
  const junctionCreateThrough = useContext(
    RecordTableWidgetContext,
  )?.junctionCreateThrough;

  const handleJunctionRecordOperation = ({
    operation,
  }: ObjectRecordOperationBrowserEventDetail) => {
    if (!isDefined(junctionCreateThrough)) {
      return;
    }

    // Operations without the written record can't be scoped, so they refresh.
    const writtenRecord =
      operation.type === 'create-one'
        ? operation.createdRecord
        : operation.type === 'restore-one'
          ? operation.restoredRecord
          : undefined;

    if (
      isDefined(writtenRecord) &&
      writtenRecord[junctionCreateThrough.sourceJoinColumnName] !==
        junctionCreateThrough.sourceRecordId
    ) {
      return;
    }

    onJunctionRecordOperation();
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleJunctionRecordOperation,
    objectMetadataItemId: junctionCreateThrough?.junctionObjectMetadataId,
    enabled: isDefined(junctionCreateThrough),
  });
};
