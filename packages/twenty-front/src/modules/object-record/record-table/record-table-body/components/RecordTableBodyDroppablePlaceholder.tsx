import { useRecordTableBodyDroppableContextOrThrow } from '@/object-record/record-table/record-table-body/contexts/RecordTableBodyDroppableContext';

export const RecordTableBodyDroppablePlaceholder = () => {
  const { droppablePlaceholder } = useRecordTableBodyDroppableContextOrThrow();

  return droppablePlaceholder;
};
