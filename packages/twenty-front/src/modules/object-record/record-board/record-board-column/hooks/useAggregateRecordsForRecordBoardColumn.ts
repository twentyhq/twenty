import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { useAggregateRecordsForHeader } from '@/object-record/record-table/hooks/useAggregateRecordsForHeader';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useAggregateRecordsForRecordBoardColumn = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const kanbanFieldName = objectMetadataItem.fields?.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  )?.name;

  if (!isDefined(kanbanFieldName)) {
    throw new Error(
      `Field name is not found for field with id ${recordIndexKanbanFieldMetadataId} on object ${objectMetadataItem.nameSingular}`,
    );
  }

  const additionalFilters = {
    [kanbanFieldName]:
      columnDefinition.value === null
        ? { is: 'NULL' }
        : { eq: columnDefinition.value },
  };

  return useAggregateRecordsForHeader({
    objectMetadataItem,
    additionalFilters,
    fallbackFieldName: kanbanFieldName,
  });
};
