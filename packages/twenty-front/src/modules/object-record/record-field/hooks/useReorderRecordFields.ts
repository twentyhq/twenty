import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

export const useReorderRecordFields = () => {
  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
  );

  const reorderRecordFields = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
        const currentRecordFields = snapshot
          .getLoadable(currentRecordFieldsCallbackState)
          .getValue();

        const reorderedRecordFields = moveArrayItem(currentRecordFields, {
          fromIndex,
          toIndex,
        });

        const reorderedRecordFieldsWithNewPosition =
          reorderedRecordFields.map<RecordField>((recordField, index) => ({
            ...recordField,
            position: index,
          }));

        set(
          currentRecordFieldsCallbackState,
          reorderedRecordFieldsWithNewPosition,
        );
      },
    [currentRecordFieldsCallbackState],
  );

  return { reorderRecordFields };
};
