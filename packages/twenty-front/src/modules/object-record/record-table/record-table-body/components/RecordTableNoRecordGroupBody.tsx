import { RecordTableBodyContextProvider } from '@/object-record/record-table/components/RecordTableBodyContextProvider';
import { RecordTableBodyNoRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyNoRecordGroupDragDropContextProvider';
import { RecordTableNoRecordGroupBodyContent } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyContent';

export const RecordTableNoRecordGroupBody = () => (
  <RecordTableBodyContextProvider>
    <RecordTableBodyNoRecordGroupDragDropContextProvider>
      <RecordTableNoRecordGroupBodyContent />
    </RecordTableBodyNoRecordGroupDragDropContextProvider>
  </RecordTableBodyContextProvider>
);
