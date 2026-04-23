import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { useCallback } from 'react';

export const useReorderRecordTableWidgetFields = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const reorderRecordTableWidgetFields = useCallback(
    (
      sourceIndex: number,
      destinationIndex: number,
      visibleFieldItems: RecordTableWidgetViewFieldItem[],
    ) => {
      if (sourceIndex === destinationIndex) {
        return;
      }

      const reorderedFields = [...visibleFieldItems];
      const [movedField] = reorderedFields.splice(sourceIndex, 1);
      reorderedFields.splice(destinationIndex, 0, movedField);

      const updates = reorderedFields.map(
        (fieldItem, index) =>
          ({
            id: fieldItem.viewField.id,
            position: index,
          }) as FlatViewField,
      );

      updateInDraft('viewFields', updates);

      applyChanges();
    },
    [applyChanges, updateInDraft],
  );

  return { reorderRecordTableWidgetFields };
};
