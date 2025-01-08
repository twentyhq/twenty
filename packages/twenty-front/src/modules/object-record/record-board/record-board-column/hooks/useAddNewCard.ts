import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useRecordSelectSearch } from '@/object-record/relation-picker/hooks/useRecordSelectSearch';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useContext } from 'react';
import { RecoilState, useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';
import { v4 as uuidv4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SetFunction = <T>(
  recoilVal: RecoilState<T>,
  valOrUpdater: T | ((currVal: T) => T),
) => void;

export const useAddNewCard = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem, objectMetadataItem } =
    useContext(RecordBoardContext);
  const { resetSearchFilter } = useRecordSelectSearch({
    recordPickerInstanceId: RelationPickerHotkeyScope.RelationPicker,
  });

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

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
      isOpportunity: boolean,
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
          isOpportunity,
          company: null,
        },
      );
    },
    [],
  );

  const createRecord = useCallback(
    (
      labelIdentifier: string,
      labelValue: string,
      position: 'first' | 'last',
      isOpportunity: boolean,
      company?: RecordForSelect,
    ) => {
      if (
        (isOpportunity && company !== null) ||
        (!isOpportunity && labelValue !== '')
      ) {
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

        if (labelIdentifierField.type === FieldMetadataType.FullName) {
          computedLabelIdentifierValue = {
            firstName: labelValue,
            lastName: '',
          };
        }

        createOneRecord({
          [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
          position,
          ...(isOpportunity
            ? { companyId: company?.id, name: company?.name }
            : {
                [labelIdentifier.toLowerCase()]: computedLabelIdentifierValue,
              }),
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
        labelIdentifier: string,
        labelValue: string,
        position: 'first' | 'last',
        isOpportunity: boolean,
        columnId?: string,
      ): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        addNewItem(set, columnDefinitionId, position, isOpportunity);
        if (isOpportunity) {
          setHotkeyScopeAndMemorizePreviousScope(
            RelationPickerHotkeyScope.RelationPicker,
          );
        } else {
          createRecord(labelIdentifier, labelValue, position, isOpportunity);
        }
      },
    [
      addNewItem,
      createRecord,
      getColumnDefinitionId,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
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
            isOpportunity: Boolean(isOpportunity),
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
    labelIdentifier: string,
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (labelValue.trim() !== '' && position !== undefined) {
      handleAddNewCardClick(
        labelIdentifier,
        labelValue.trim(),
        position,
        false,
        '',
      );
      onCreateSuccess?.();
    }
  };

  const handleBlur = (
    labelIdentifier: string,
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (labelValue.trim() === '') {
      onCreateSuccess?.();
    } else {
      handleCreate(labelIdentifier, labelValue, position, onCreateSuccess);
    }
  };

  const handleInputEnter = (
    labelIdentifier: string,
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    handleCreate(labelIdentifier, labelValue, position, onCreateSuccess);
  };

  const handleEntitySelect = useCallback(
    (
      position: 'first' | 'last',
      company: RecordForSelect,
      columnId?: string,
    ) => {
      const columnDefinitionId = getColumnDefinitionId(columnId);
      createRecord('', '', position, true, company);
      handleCreateSuccess(position, columnDefinitionId, true);
    },
    [createRecord, handleCreateSuccess, getColumnDefinitionId],
  );

  return {
    handleAddNewCardClick,
    handleCreateSuccess,
    handleCreate,
    handleBlur,
    handleInputEnter,
    handleEntitySelect,
  };
};
