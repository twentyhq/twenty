import { RecordGroupTabs } from '@/object-record/record-group/components/RecordGroupTabs';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/components/RecordTableBodyContextProvider';
import { RecordTableBodyNoRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyNoRecordGroupDragDropContextProvider';
import { RecordTableNoRecordGroupBodyContent } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyContent';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableNoRecordGroupBody = () => (
  <RecordTableBodyContextProvider>
    <RecordTableBodyNoRecordGroupDragDropContextProvider>
      <RecordGroupTabs
        viewType={ViewType.TABLE}
        dndType={RECORD_TABLE_ROW_DND_TYPE}
      />
      <RecordTableNoRecordGroupBodyContent />
    </RecordTableBodyNoRecordGroupDragDropContextProvider>
  </RecordTableBodyContextProvider>
);
