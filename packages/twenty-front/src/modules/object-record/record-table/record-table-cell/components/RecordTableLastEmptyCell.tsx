import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  return (
    <>
      <RecordTableTd isSelected={isSelected} hasRightBorder={false} />
      <RecordTableTd isSelected={isSelected} hasRightBorder={false} />
    </>
  );
};
