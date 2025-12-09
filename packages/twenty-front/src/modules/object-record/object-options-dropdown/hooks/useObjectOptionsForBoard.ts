import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { produce } from 'immer';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { sortByProperty } from '~/utils/array/sortByProperty';

type useObjectOptionsForBoardParams = {
  objectNameSingular: string;
  recordBoardId: string;
  viewBarId: string;
};

export const useObjectOptionsForBoard = ({
  objectNameSingular,
  recordBoardId,
}: useObjectOptionsForBoardParams) => {
  const [recordIndexFieldDefinitions, setRecordIndexFieldDefinitions] =
    useRecoilState(recordIndexFieldDefinitionsState);

  const { saveViewFields } = useSaveCurrentViewFields();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromObjectMetadata(objectMetadataItem);

  const availableColumnDefinitions = useMemo(
    () =>
      columnDefinitions.filter(({ isLabelIdentifier }) => !isLabelIdentifier),
    [columnDefinitions],
  );

  const recordIndexFieldDefinitionsByKey = useMemo(
    () =>
      mapArrayToObject(
        recordIndexFieldDefinitions,
        ({ fieldMetadataId }) => fieldMetadataId,
      ),
    [recordIndexFieldDefinitions],
  );

  const visibleBoardFields = useMemo(
    () =>
      recordIndexFieldDefinitions
        .filter((boardField) => boardField.isVisible)
        .sort(
          (boardFieldA, boardFieldB) =>
            boardFieldA.position - boardFieldB.position,
        ),
    [recordIndexFieldDefinitions],
  );

  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordBoardId);

  const hiddenBoardFields = useMemo(
    () =>
      availableColumnDefinitions
        .filter(
          ({ fieldMetadataId }) =>
            !recordIndexFieldDefinitionsByKey[fieldMetadataId]?.isVisible,
        )
        .map((availableColumnDefinition) => {
          const { fieldMetadataId } = availableColumnDefinition;
          const existingBoardField =
            recordIndexFieldDefinitionsByKey[fieldMetadataId];

          return {
            ...(existingBoardField || availableColumnDefinition),
            isVisible: false,
          };
        }),
    [availableColumnDefinitions, recordIndexFieldDefinitionsByKey],
  );

  const handleReorderBoardFields: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const updatedRecordField = reorderVisibleRecordFields({
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);

      const modifiedRecordIndexFieldDefinitions = produce(
        recordIndexFieldDefinitions,
        (draftRecordIndexFieldDefinitions) => {
          const indexToModify = draftRecordIndexFieldDefinitions.findIndex(
            (recordIndexFieldDefinitionToModify) =>
              recordIndexFieldDefinitionToModify.fieldMetadataId ===
              updatedRecordField.fieldMetadataItemId,
          );

          draftRecordIndexFieldDefinitions[indexToModify].position =
            updatedRecordField.position;
        },
      );

      // TODO: remove after refactor
      setRecordIndexFieldDefinitions(modifiedRecordIndexFieldDefinitions);
    },
    [
      saveViewFields,
      setRecordIndexFieldDefinitions,
      recordIndexFieldDefinitions,
      reorderVisibleRecordFields,
    ],
  );

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    recordBoardId,
  );

  const { updateRecordField } = useUpdateRecordField(recordBoardId);
  const { upsertRecordField } = useUpsertRecordField(recordBoardId);

  // Todo : this seems over complex and should at least be extracted to an util with unit test.
  // Let's refactor this as we introduce the new viewBar
  const handleBoardFieldVisibilityChange = useCallback(
    async (
      updatedFieldDefinition: Pick<
        ColumnDefinition<FieldMetadata>,
        'fieldMetadataId' | 'isVisible'
      >,
    ) => {
      const lastPosition = currentRecordFields.toSorted(
        sortByProperty('position', 'desc'),
      )[0].position;

      const shouldShowFieldMetadataItem =
        updatedFieldDefinition.isVisible === true;
      const corresponingRecordField = currentRecordFields.find(
        (recordFieldToFind) =>
          recordFieldToFind.fieldMetadataItemId ===
          updatedFieldDefinition.fieldMetadataId,
      );

      const noExistingRecordField = !isDefined(corresponingRecordField);

      if (noExistingRecordField) {
        const recordFieldToUpsert: RecordField = {
          id: v4(),
          fieldMetadataItemId: updatedFieldDefinition.fieldMetadataId,
          size: 100,
          isVisible: shouldShowFieldMetadataItem,
          position: lastPosition + 1,
        };

        upsertRecordField(recordFieldToUpsert);

        saveViewFields([mapRecordFieldToViewField(recordFieldToUpsert)]);

        const correspondingAvailableColumnDefinition =
          availableColumnDefinitions.find(
            findByProperty(
              'fieldMetadataId',
              updatedFieldDefinition.fieldMetadataId,
            ),
          );

        const modifiedRecordIndexFieldDefinitions = produce(
          recordIndexFieldDefinitions,
          (draftRecordIndexFieldDefinitions) => {
            if (!isDefined(correspondingAvailableColumnDefinition)) {
              throw new Error(
                `correspondingAvailableColumnDefinition is not defined this should not happen.`,
              );
            }

            draftRecordIndexFieldDefinitions.push({
              ...correspondingAvailableColumnDefinition,
              fieldMetadataId: updatedFieldDefinition.fieldMetadataId,
              isVisible: shouldShowFieldMetadataItem,
            });
          },
        );

        // TODO: remove after refactor
        setRecordIndexFieldDefinitions(modifiedRecordIndexFieldDefinitions);
      } else {
        updateRecordField(updatedFieldDefinition.fieldMetadataId, {
          isVisible: shouldShowFieldMetadataItem,
        });

        const updatedRecordField: RecordField = {
          ...corresponingRecordField,
          isVisible: shouldShowFieldMetadataItem,
        };

        saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);

        const modifiedRecordIndexFieldDefinitions = produce(
          recordIndexFieldDefinitions,
          (draftRecordIndexFieldDefinitions) => {
            const indexToModify = draftRecordIndexFieldDefinitions.findIndex(
              (recordIndexFieldDefinitionToModify) =>
                recordIndexFieldDefinitionToModify.fieldMetadataId ===
                updatedRecordField.fieldMetadataItemId,
            );

            draftRecordIndexFieldDefinitions[indexToModify].isVisible =
              shouldShowFieldMetadataItem;
          },
        );

        // TODO: remove after refactor
        setRecordIndexFieldDefinitions(modifiedRecordIndexFieldDefinitions);
      }
    },
    [
      currentRecordFields,
      updateRecordField,
      upsertRecordField,
      setRecordIndexFieldDefinitions,
      saveViewFields,
      recordIndexFieldDefinitions,
      availableColumnDefinitions,
    ],
  );

  return {
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    visibleBoardFields,
    hiddenBoardFields,
  };
};
