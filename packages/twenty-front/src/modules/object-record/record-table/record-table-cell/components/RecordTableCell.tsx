import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';

export const RecordTableCell = () => {
  return <RecordTableCellContainer nonEditModeContent={<FieldDisplay />} />;
};
