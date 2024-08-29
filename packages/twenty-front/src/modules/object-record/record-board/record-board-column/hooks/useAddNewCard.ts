import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useContext } from 'react';

export const useAddNewCard = (position: string) => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const handleAddNewCardClick = () => {
    createOneRecord({
      [selectFieldMetadataItem.name]: columnDefinition.value,
      position: position,
    });
  };

  return {
    handleAddNewCardClick,
  };
};
