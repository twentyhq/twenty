import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';

export const RecordTableCell = () => {
  return (
    <FieldFocusContextProvider>
      <RecordTableCellContainer nonEditModeContent={<FieldDisplay />} />
    </FieldFocusContextProvider>
  );
};
