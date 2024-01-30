import { useCallback, useMemo } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilState } from 'recoil';

import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useViewFields } from '@/views/hooks/internal/useViewFields';

type useRecordIndexOptionsForBoardParams = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useRecordIndexOptionsForBoard = ({
  objectNameSingular,
  viewBarId,
}: useRecordIndexOptionsForBoardParams) => {
  const [recordIndexFieldDefinitions, setRecordIndexFieldDefinitions] =
    useRecoilState(recordIndexFieldDefinitionsState);

  const { persistViewFields } = useViewFields(viewBarId);

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const visibleBoardFields = useMemo(
    () =>
      columnDefinitions.filter((columnDefinition) => {
        return recordIndexFieldDefinitions.some(
          (existingRecordFieldDefinition) => {
            return (
              columnDefinition.fieldMetadataId ===
                existingRecordFieldDefinition.fieldMetadataId &&
              existingRecordFieldDefinition.isVisible
            );
          },
        );
      }),
    [columnDefinitions, recordIndexFieldDefinitions],
  );

  const hiddenBoardFields = useMemo(
    () =>
      columnDefinitions.filter((columnDefinition) => {
        return !recordIndexFieldDefinitions.some(
          (existingRecordFieldDefinition) => {
            return (
              columnDefinition.fieldMetadataId ===
                existingRecordFieldDefinition.fieldMetadataId &&
              existingRecordFieldDefinition.isVisible
            );
          },
        );
      }),
    [columnDefinitions, recordIndexFieldDefinitions],
  );

  const handleReorderBoardFields: OnDragEndResponder = useCallback(
    (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const reorderFields = [...recordIndexFieldDefinitions];
      const [removed] = reorderFields.splice(result.source.index - 1, 1);
      reorderFields.splice(result.destination.index - 1, 0, removed);

      const updatedFields = reorderFields.map((field, index) => ({
        ...field,
        position: index,
      }));

      setRecordIndexFieldDefinitions(updatedFields);
      persistViewFields(mapBoardFieldDefinitionsToViewFields(updatedFields));
    },
    [
      persistViewFields,
      recordIndexFieldDefinitions,
      setRecordIndexFieldDefinitions,
    ],
  );

  // Todo : this seems over complex and should at least be extracted to an util with unit test.
  // Let's refactor this as we introduce the new viewBar
  const handleBoardFieldVisibilityChange = useCallback(
    async (
      updatedFieldDefinition: Omit<
        ColumnDefinition<FieldMetadata>,
        'size' | 'position'
      >,
    ) => {
      const isNewViewField = !recordIndexFieldDefinitions.some(
        (fieldDefinition) =>
          fieldDefinition.fieldMetadataId ===
          updatedFieldDefinition.fieldMetadataId,
      );

      let updatedFieldsDefinitions: ColumnDefinition<FieldMetadata>[];

      if (isNewViewField) {
        const correspondingFieldDefinition = columnDefinitions.find(
          (availableTableColumn) =>
            availableTableColumn.fieldMetadataId ===
            updatedFieldDefinition.fieldMetadataId,
        );
        if (!correspondingFieldDefinition) return;

        updatedFieldsDefinitions = [
          ...recordIndexFieldDefinitions,
          { ...correspondingFieldDefinition, isVisible: true },
        ];
      } else {
        updatedFieldsDefinitions = recordIndexFieldDefinitions.map(
          (exitingFieldDefinition) =>
            exitingFieldDefinition.fieldMetadataId ===
            updatedFieldDefinition.fieldMetadataId
              ? {
                  ...exitingFieldDefinition,
                  isVisible: !updatedFieldDefinition.isVisible,
                }
              : exitingFieldDefinition,
        );
      }

      setRecordIndexFieldDefinitions(updatedFieldsDefinitions);
      persistViewFields(
        mapBoardFieldDefinitionsToViewFields(updatedFieldsDefinitions),
      );
    },
    [
      recordIndexFieldDefinitions,
      setRecordIndexFieldDefinitions,
      persistViewFields,
      columnDefinitions,
    ],
  );

  return {
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    visibleBoardFields,
    hiddenBoardFields,
  };
};
