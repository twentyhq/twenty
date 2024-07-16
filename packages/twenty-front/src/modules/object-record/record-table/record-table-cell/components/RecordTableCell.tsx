import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';

export const RecordTableCell = () => {
  return (
    <FieldFocusContextProvider>
      <RecordTableCellContainer
        editModeContent={<RecordTableCellFieldInput />}
        nonEditModeContent={<FieldDisplay />}
      />
    </FieldFocusContextProvider>
  );
};
