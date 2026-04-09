import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';

export const useReorderRecordTableWidgetFields = () => {
  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();

  const reorderRecordTableWidgetFields = useCallback(
    async (
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

      const updates = reorderedFields.map((fieldItem, index) => ({
        input: {
          id: fieldItem.viewField.id,
          update: { position: index },
        },
      }));

      await performViewFieldAPIUpdate(updates);
    },
    [performViewFieldAPIUpdate],
  );

  return { reorderRecordTableWidgetFields };
};
