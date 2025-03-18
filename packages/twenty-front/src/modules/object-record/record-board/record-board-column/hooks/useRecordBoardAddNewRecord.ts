import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useContext } from 'react';

export const useRecordBoardAddNewRecord = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const createNewBoardRecord = (position: 'first' | 'last') => {
    createOneRecord({
      [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
      position,
    });
  };

  return {
    createNewBoardRecord,
  };
};
