import { useCallback, useMemo } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilState } from 'recoil';

import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useViews } from '@/views/hooks/internal/useViews';
import { GraphQLView } from '@/views/types/GraphQLView';

type useRecordIndexOptionsForBoardParams = {
  objectNameSingular: string;
  recordBoardId: string;
  viewBarId: string;
};

export const useRecordIndexOptionsForBoard = ({
  objectNameSingular,
  recordBoardId,
  viewBarId,
}: useRecordIndexOptionsForBoardParams) => {
  const [recordIndexFieldDefinitions, setRecordIndexFieldDefinitions] =
    useRecoilState(recordIndexFieldDefinitionsState);

  const { persistViewFields } = useViewFields(viewBarId);
  const { updateView } = useViews(viewBarId);
  const { getIsCompactModeActiveState } = useRecordBoard(recordBoardId);

  const [isCompactModeActive, setIsCompactModeActive] = useRecoilState(
    getIsCompactModeActiveState(),
  );

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const boardFields = useMemo(
    () =>
      columnDefinitions.filter(
        (columnDefinition) =>
          filterAvailableTableColumns(columnDefinition) &&
          !isLabelIdentifierField({
            fieldMetadataItem: {
              id: columnDefinition.fieldMetadataId,
              name: columnDefinition.metadata.fieldName,
            },
            objectMetadataItem,
          }),
      ),
    [columnDefinitions, objectMetadataItem],
  );

  const visibleBoardFields = useMemo(
    () =>
      boardFields.filter((columnDefinition) => {
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
    [boardFields, recordIndexFieldDefinitions],
  );

  const hiddenBoardFields = useMemo(
    () =>
      boardFields.filter((columnDefinition) => {
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
    [boardFields, recordIndexFieldDefinitions],
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
        const correspondingFieldDefinition = boardFields.find(
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
                  isVisible: !exitingFieldDefinition.isVisible,
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
      boardFields,
    ],
  );

  const setAndPersistIsCompactModeActive = useCallback(
    (isCompactModeActive: boolean, view: GraphQLView | undefined) => {
      if (!view) return;
      setIsCompactModeActive(isCompactModeActive);
      updateView({
        ...view,
        isCompact: isCompactModeActive,
      });
    },
    [setIsCompactModeActive, updateView],
  );

  return {
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    visibleBoardFields,
    hiddenBoardFields,
    isCompactModeActive,
    setAndPersistIsCompactModeActive,
  };
};
