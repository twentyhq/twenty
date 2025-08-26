import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from 'twenty-ui/record-table';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  return <RecordTableTd isSelected={isSelected} hasRightBorder={false} />;
};
