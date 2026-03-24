import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWidgetSetReadOnlyColumnHeadersEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetSetReadOnlyColumnHeadersEffect';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';

export const RecordTableWidget = () => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordTableWidgetSetReadOnlyColumnHeadersEffect
        recordTableId={recordIndexId}
      />
      <RecordTableWithWrappers
        recordTableId={recordIndexId}
        objectNameSingular={objectNameSingular}
        viewBarId={viewBarInstanceId}
      />
    </>
  );
};
