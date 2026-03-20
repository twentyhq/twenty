import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useViewById } from '@/views/hooks/useViewById';
import { type ViewField } from '@/views/types/ViewField';
import { useCallback, useMemo } from 'react';

export type RecordTableWidgetViewFieldItem = {
  viewField: ViewField;
  fieldMetadataItem: FieldMetadataItem;
};

export const useRecordTableWidgetViewFields = (viewId: string) => {
  const { view } = useViewById(viewId);
  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();
  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();

  const viewFieldItems: RecordTableWidgetViewFieldItem[] = useMemo(() => {
    if (!view) {
      return [];
    }

    return view.viewFields
      .toSorted((fieldA, fieldB) => fieldA.position - fieldB.position)
      .map((viewField) => {
        try {
          const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
            viewField.fieldMetadataId,
          );
          return { viewField, fieldMetadataItem };
        } catch {
          return null;
        }
      })
      .filter((item): item is RecordTableWidgetViewFieldItem => item !== null);
  }, [view, getFieldMetadataItemByIdOrThrow]);

  const toggleRecordTableWidgetFieldVisibility = useCallback(
    async (viewFieldId: string, isVisible: boolean) => {
      await performViewFieldAPIUpdate([
        {
          input: {
            id: viewFieldId,
            update: { isVisible },
          },
        },
      ]);
    },
    [performViewFieldAPIUpdate],
  );

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

  return {
    viewFieldItems,
    toggleRecordTableWidgetFieldVisibility,
    reorderRecordTableWidgetFields,
  };
};
