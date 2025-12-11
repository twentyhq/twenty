import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDragDropContextProvider';
import { RecordTableRecordGroupWrapper } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupWrapper';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableRecordGroupsBody = () => {
  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Table,
  );

  if (isRecordTableInitialLoading && allRecordIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <>
      <RecordTableBodyRecordGroupDragDropContextProvider>
        {visibleRecordGroupIds.map((recordGroupId, index) => (
          <RecordTableRecordGroupWrapper
            key={recordGroupId}
            recordGroupId={recordGroupId}
            index={index}
          />
        ))}
        <RecordIndexGroupAggregatesDataLoader />
      </RecordTableBodyRecordGroupDragDropContextProvider>
    </>
  );
};
