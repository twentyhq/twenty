import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
import { RecordTableRecordGroupRows } from '@/object-record/record-table/components/RecordTableRecordGroupRows';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDragDropContextProvider';
import { RecordTableBodyRecordGroupDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDroppable';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableRecordGroupSection } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSection';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableRecordGroupsBody = () => {
  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useAtomComponentStateValue(
    isRecordTableInitialLoadingComponentState,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
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
          <RecordTableRecordGroupBodyContextProvider
            key={recordGroupId}
            recordGroupId={recordGroupId}
          >
            <RecordGroupContext.Provider value={{ recordGroupId }}>
              <RecordTableBodyRecordGroupDroppable
                recordGroupId={recordGroupId}
              >
                <RecordTableRecordGroupSection />
                <RecordTableRecordGroupRows />
                {index === 0 && <RecordTableCellPortals />}
              </RecordTableBodyRecordGroupDroppable>
            </RecordGroupContext.Provider>
          </RecordTableRecordGroupBodyContextProvider>
        ))}
        <RecordIndexGroupAggregatesDataLoader />
      </RecordTableBodyRecordGroupDragDropContextProvider>
    </>
  );
};
