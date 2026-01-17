import { useListenToObjectRecordOperationBrowserEvent } from '@/object-record/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const handleObjectRecordOperation = (
    objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
  ) => {
    const objectRecordOperation = objectRecordOperationEventDetail.operation;

    const isUpdateOperation =
      objectRecordOperation.type === 'update-one' ||
      objectRecordOperation.type === 'update-many';

    if (isUpdateOperation) {
      const updateInputs =
        objectRecordOperation.type === 'update-one'
          ? [objectRecordOperation.result.updateInput]
          : objectRecordOperation.result.updateInputs;

      const shouldResetForUpdateOperation =
        getShouldResetTableVirtualizationForUpdateInputs(updateInputs);

      if (shouldResetForUpdateOperation) {
        resetVirtualizationBecauseDataChanged();
      }
    } else {
      resetVirtualizationBecauseDataChanged();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return <></>;
};
