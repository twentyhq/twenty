import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useCallback, useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const useAddNewCard = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

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

  const addNewCard = useCallback(
    (set: any, columnDefinitionId: string, position: 'first' | 'last') => {
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
    ) => {
      if (labelValue !== '') {
        createOneRecord({
          [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
          position,
          [labelIdentifier.toLowerCase()]: labelValue,
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
        columnId?: string,
      ): void => {
        const columnDefinitionId = getColumnDefinitionId(columnId);
        addNewCard(set, columnDefinitionId, position);
        createRecord(labelIdentifier, labelValue, position);
      },
    [addNewCard, createRecord, getColumnDefinitionId],
  );

  const handleCreateSuccess = useRecoilCallback(
    ({ set }) =>
      (position: 'first' | 'last', columnId?: string): void => {
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
          },
        );
      },
    [getColumnDefinitionId],
  );

  const handleCreate = (
    labelIdentifier: string,
    labelValue: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (labelValue.trim() !== '' && position !== undefined) {
      handleAddNewCardClick(labelIdentifier, labelValue.trim(), position);
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

  return {
    handleAddNewCardClick,
    handleCreateSuccess,
    handleCreate,
    handleBlur,
    handleInputEnter,
  };
};
