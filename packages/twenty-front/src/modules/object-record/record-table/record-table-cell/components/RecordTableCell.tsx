import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldFocusStaticUnfocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';

export const RecordTableCell = () => {
  return (
    <FieldFocusStaticUnfocusedProvider>
      <RecordTableCellContainer nonEditModeContent={<FieldDisplay />} />
    </FieldFocusStaticUnfocusedProvider>
  );
};
