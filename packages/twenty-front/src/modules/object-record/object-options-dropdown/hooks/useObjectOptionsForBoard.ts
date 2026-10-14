import { useCallback, useMemo } from 'react';

import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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
    useAtomComponentState(recordIndexFieldDefinitionsState, recordBoardId);

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
            ...(existingBoardField ?? availableColumnDefinition),
            isVisible: false,
          };
        }),
    [availableColumnDefinitions, recordIndexFieldDefinitionsByKey],
  );

  const handleReorderBoardFields = useCallback(
    ({
      recordFieldToMove,
      targetRecordField,
    }: {
      recordFieldToMove: Pick<
        RecordField,
        'id' | 'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
      >;
      targetRecordField: Pick<RecordField, 'id'>;
    }) => {
      const updatedRecordField = reorderVisibleRecordFields({
        recordFieldToMove,
        targetRecordField,
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

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordBoardId,
  );

  const { updateRecordField } = useUpdateRecordField(recordBoardId);
  const { upsertRecordField } = useUpsertRecordField(recordBoardId);

  // TODO: overly complex; extract to a unit-tested util.
  const handleBoardFieldVisibilityChange = useCallback(
    async ({
      recordField,
      isVisible,
    }: {
      recordField: Pick<
        RecordField,
        'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
      >;
      isVisible: boolean;
    }) => {
      const lastPosition = currentRecordFields.toSorted(
        sortByProperty('position', 'desc'),
      )[0].position;

      const shouldShowFieldMetadataItem = isVisible === true;
      const recordFieldKey = getRecordFieldKey(recordField);
      const corresponingRecordField = currentRecordFields.find(
        (recordFieldToFind) =>
          getRecordFieldKey(recordFieldToFind) === recordFieldKey,
      );

      const noExistingRecordField = !isDefined(corresponingRecordField);

      if (noExistingRecordField) {
        const recordFieldToUpsert: RecordField = {
          id: v4(),
          fieldMetadataItemId: recordField.fieldMetadataItemId,
          relationTargetFieldMetadataItemId:
            recordField.relationTargetFieldMetadataItemId,
          size: 100,
          isVisible: shouldShowFieldMetadataItem,
          position: lastPosition + 1,
        };

        upsertRecordField(recordFieldToUpsert);

        saveViewFields([mapRecordFieldToViewField(recordFieldToUpsert)]);

        const correspondingAvailableColumnDefinition =
          availableColumnDefinitions.find(
            findByProperty('fieldMetadataId', recordField.fieldMetadataItemId),
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
              fieldMetadataId: recordField.fieldMetadataItemId,
              isVisible: shouldShowFieldMetadataItem,
            });
          },
        );

        // TODO: remove after refactor
        setRecordIndexFieldDefinitions(modifiedRecordIndexFieldDefinitions);
      } else {
        updateRecordField(recordFieldKey, {
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
