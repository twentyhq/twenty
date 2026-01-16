import { useListenToObjectRecordOperationBrowserEvent } from '@/object-record/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useGetShouldInitializeRecordBoardForUpdateInputs } from '@/object-record/record-board/hooks/useGetShouldInitializeRecordBoardForUpdateInputs';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';

export const RecordBoardDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();
  const { getShouldInitializeRecordBoardForUpdateInputs } =
    useGetShouldInitializeRecordBoardForUpdateInputs();

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

      const shouldInitializeForUpdateOperation =
        getShouldInitializeRecordBoardForUpdateInputs(updateInputs);

      if (shouldInitializeForUpdateOperation) {
        triggerRecordBoardInitialQuery();
      }
    } else {
      triggerRecordBoardInitialQuery();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return null;
};
