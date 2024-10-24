import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback, useContext } from 'react';
import { RecoilState, useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

type SetFunction = <T>(
  recoilVal: RecoilState<T>,
  valOrUpdater: T | ((currVal: T) => T),
) => void;

export const useAddNewCard = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);
  const { resetSearchFilter } = useEntitySelectSearch({
    relationPickerScopeId: 'relation-picker',
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
      company?: EntityForSelect,
    ) => {
      if (
        (isOpportunity && company !== null) ||
        (!isOpportunity && labelValue !== '')
      ) {
        createOneRecord({
          [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
          position,
          ...(isOpportunity
            ? { companyId: company?.id, name: company?.name }
            : { [labelIdentifier.toLowerCase()]: labelValue }),
        });
      }
    },
    [createOneRecord, columnContext, selectFieldMetadataItem],
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
      company: EntityForSelect,
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
