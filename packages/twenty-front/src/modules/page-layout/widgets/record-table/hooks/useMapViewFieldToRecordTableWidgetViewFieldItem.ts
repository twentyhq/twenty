import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { type ViewField } from '@/views/types/ViewField';
import { useCallback } from 'react';

export const useMapViewFieldToRecordTableWidgetViewFieldItem = () => {
  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const mapViewFieldToRecordTableWidgetViewFieldItem = useCallback(
    (viewField: ViewField): RecordTableWidgetViewFieldItem | null => {
      try {
        const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
          viewField.fieldMetadataId,
        );
        return { viewField, fieldMetadataItem };
      } catch {
        return null;
      }
    },
    [getFieldMetadataItemByIdOrThrow],
  );

  return { mapViewFieldToRecordTableWidgetViewFieldItem };
};
