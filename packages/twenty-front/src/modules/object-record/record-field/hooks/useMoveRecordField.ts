import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useMoveRecordField = () => {
  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
  );

  const moveRecordField = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        direction,
        fieldMetadataItemIdToMove,
      }: {
        direction: 'before' | 'after';
        fieldMetadataItemIdToMove: string;
      }) => {
        const currentRecordFields = snapshot
          .getLoadable(currentRecordFieldsCallbackState)
          .getValue();

        const indexOfRecordFieldToMove = currentRecordFields.findIndex(
          (recordField) =>
            recordField.fieldMetadataItemId === fieldMetadataItemIdToMove,
        );

        if (indexOfRecordFieldToMove === -1) {
          return;
        }

        const newRecordFields = [...currentRecordFields];

        const targetArrayIndex =
          direction === 'before'
            ? indexOfRecordFieldToMove - 1
            : indexOfRecordFieldToMove + 1;

        const targetArraySize = newRecordFields.length - 1;

        if (
          indexOfRecordFieldToMove >= 0 &&
          targetArrayIndex >= 0 &&
          indexOfRecordFieldToMove <= targetArraySize &&
          targetArrayIndex <= targetArraySize
        ) {
          const currentRecordField = newRecordFields[indexOfRecordFieldToMove];
          const targetRecordField = newRecordFields[targetArrayIndex];

          const targetRecordFieldNewPosition = currentRecordField.position;
          const currentRecordFieldNewPosition = targetRecordField.position;

          newRecordFields[indexOfRecordFieldToMove] = {
            ...newRecordFields[indexOfRecordFieldToMove],
            position: currentRecordFieldNewPosition,
          };

          newRecordFields[targetRecordFieldNewPosition] = {
            ...newRecordFields[targetRecordFieldNewPosition],
            position: targetRecordFieldNewPosition,
          };

          set(currentRecordFieldsCallbackState, newRecordFields);
        }
      },
    [currentRecordFieldsCallbackState],
  );

  return { moveRecordField };
};
