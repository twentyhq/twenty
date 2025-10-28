import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';

import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useRecoilCallback } from 'recoil';

export const useProcessOptionDropdownDragEnd = (recordTableId: string) => {
  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordTableId);

  const { saveViewFields } = useSaveCurrentViewFields();

  const processOptionDropdownDragEnd: OnDragEndResponder = useRecoilCallback(
    () => async (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const updatedRecordField = reorderVisibleRecordFields({
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
    },
    [reorderVisibleRecordFields, saveViewFields],
  );

  return {
    processOptionDropdownDragEnd,
  };
};
