import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useContext } from 'react';
import { RecoilState, useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';
import { v4 as uuidv4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SetFunction = <T>(
  recoilVal: RecoilState<T>,
  valOrUpdater: T | ((currVal: T) => T),
) => void;

type UseAddNewCardProps = {
  recordPickerComponentInstanceId: string;
};

export const useAddNewCard = ({
  recordPickerComponentInstanceId,
}: UseAddNewCardProps) => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem, objectMetadataItem } =
    useContext(RecordBoardContext);
  const { resetSearchFilter } = useSingleRecordPickerSearch(
    recordPickerComponentInstanceId,
  );

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const getColumnDefinitionId = useCallback(
    (columnId?: string) => {
      const columnDefinitionId = columnId || columnContext?.columnDefinition.id;
      if (!columnDefinitionId) {
        throw new Error('Column ID is required');
      }
      return columnDefinitionId;
    },
    [columnContext],
  );

  const addNewItem = useCallback(
    (
      set: SetFunction,
      columnDefinitionId: string,
      position: 'first' | 'last',
    ) => {
      set(
        recordBoardNewRecordByColumnIdSelector({
          familyKey: columnDefinitionId,
          scopeId: columnDefinitionId,
        }),
        {
          id: uuidv4(),
          columnId: columnDefinitionId,
          isCreating: true,
          position,
          company: null,
        },
      );
    },
    [],
  );

  const createRecord = useCallback(
    (labelValue: string, position: 'first' | 'last') => {
      if (labelValue !== '') {
        // TODO: Refactor this whole section (Add new card): this should be:
        // - simpler
        // - piloted by metadata,
        // - avoid drill down props, especially internal stuff
        // - and follow record table pending record creation logic
        let computedLabelIdentifierValue: any = labelValue;

        const labelIdentifierField = objectMetadataItem?.fields.find(
          (field) =>
            field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
        );

        if (!isDefined(labelIdentifierField)) {
          throw new Error('Label identifier field not found');
        }

        if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
          computedLabelIdentifierValue = {
            firstName: labelValue,
            lastName: '',
          };
        }

        createOneRecord({
          [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
          position,
          [labelIdentifierField.name]: computedLabelIdentifierValue,
        });
      }
    },
    [
      objectMetadataItem?.fields,
      objectMetadataItem?.labelIdentifierFieldMetadataId,
      createOneRecord,
      selectFieldMetadataItem?.name,
      columnContext?.columnDefinition?.value,
    ],
  );

  const handleAddNewCardClick = useRecoilCallback(
    ({ set }) =>
      (
        labelValue: string,
        position: 'first' | 'last',
        columnId?: string,
      ): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        addNewItem(set, columnDefinitionId, position);

        createRecord(labelValue, position);
      },
    [addNewItem, createRecord, getColumnDefinitionId],
  );

  const handleCreateSuccess = useRecoilCallback(
    ({ set }) =>
      (
        position: 'first' | 'last',
        columnId?: string,
        isOpportunity = false,
      ): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        set(
          recordBoardNewRecordByColumnIdSelector({
            familyKey: columnDefinitionId,
            scopeId: columnDefinitionId,
          }),
          {
            id: '',
            columnId: columnDefinitionId,
            isCreating: false,
            position,
            company: null,
          },
        );
        resetSearchFilter();
        if (isOpportunity === true) {
          goBackToPreviousHotkeyScope();
        }
      },
    [getColumnDefinitionId, goBackToPreviousHotkeyScope, resetSearchFilter],
  );

  const handleCreate = (
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (labelValue.trim() !== '' && position !== undefined) {
      handleAddNewCardClick(labelValue.trim(), position, '');
      onCreateSuccess?.();
    }
  };

  const handleBlur = (
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (labelValue.trim() === '') {
      onCreateSuccess?.();
    } else {
      handleCreate(labelValue, position, onCreateSuccess);
    }
  };

  const handleInputEnter = (
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    handleCreate(labelValue, position, onCreateSuccess);
  };

  return {
    handleAddNewCardClick,
    handleCreateSuccess,
    handleBlur,
    handleInputEnter,
  };
};
