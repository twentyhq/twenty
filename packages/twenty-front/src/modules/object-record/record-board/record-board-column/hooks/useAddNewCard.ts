import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const useAddNewCard = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const handleAddNewCardClick = useRecoilCallback(
    ({ set }) =>
      (title: string, position: 'first' | 'last') => {
        set(
          recordBoardNewRecordByColumnIdSelector({
            familyKey: columnDefinition.id,
            scopeId: columnDefinition.id,
          }),
          {
            id: uuidv4(),
            columnId: columnDefinition.id,
            isCreating: true,
            position,
          },
        );

        if (title !== '') {
          createOneRecord({
            [selectFieldMetadataItem.name]: columnDefinition.value,
            position,
            title,
          });
        }
      },
    [
      columnDefinition.id,
      columnDefinition.value,
      createOneRecord,
      selectFieldMetadataItem,
    ],
  );

  const handleCreateSuccess = useRecoilCallback(
    ({ set }) =>
      (position: 'first' | 'last') => {
        set(
          recordBoardNewRecordByColumnIdSelector({
            familyKey: columnDefinition.id,
            scopeId: columnDefinition.id,
          }),
          {
            id: '',
            columnId: columnDefinition.id,
            isCreating: false,
            position,
          },
        );
      },
    [columnDefinition.id],
  );

  return {
    handleAddNewCardClick,
    handleCreateSuccess,
  };
};
