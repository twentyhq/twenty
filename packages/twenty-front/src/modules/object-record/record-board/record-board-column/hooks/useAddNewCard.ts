import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const useAddNewCard = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const handleAddNewCardClick = useRecoilCallback(
    ({ set }) =>
      (title: string, position: 'first' | 'last', columnId?: string): void => {
        const columnDefinitionId =
          columnId || columnContext?.columnDefinition.id;
        if (!columnDefinitionId) {
          throw new Error('Column ID is required');
        }

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

        if (title !== '') {
          createOneRecord({
            [selectFieldMetadataItem.name]:
              columnContext?.columnDefinition.value,
            position,
            title,
          });
        }
      },
    [
      columnContext?.columnDefinition?.id,
      columnContext?.columnDefinition?.value,
      createOneRecord,
      selectFieldMetadataItem,
    ],
  );

  const handleCreateSuccess = useRecoilCallback(
    ({ set }) =>
      (position: 'first' | 'last', columnId?: string): void => {
        const columnDefinitionId =
          columnId || columnContext?.columnDefinition.id;
        if (!columnDefinitionId) {
          throw new Error('Column ID is required');
        }

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
    [columnContext?.columnDefinition?.id],
  );

  const handleCreate = (
    title: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (title.trim() !== '' && position !== undefined) {
      handleAddNewCardClick(title.trim(), position);
      onCreateSuccess?.();
    }
  };

  const handleBlur = (
    title: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    if (title.trim() === '') {
      onCreateSuccess?.();
    } else {
      handleCreate(title, position, onCreateSuccess);
    }
  };

  const handleInputEnter = (
    title: string,
    position: 'first' | 'last',
    onCreateSuccess?: () => void,
  ) => {
    handleCreate(title, position, onCreateSuccess);
  };

  return {
    handleAddNewCardClick,
    handleCreateSuccess,
    handleCreate,
    handleBlur,
    handleInputEnter,
  };
};
