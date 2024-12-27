import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
import { RecordTableRecordGroupRows } from '@/object-record/record-table/components/RecordTableRecordGroupRows';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDragDropContextProvider';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRecordGroupEmptyRow } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupEmptyRow';
import { RecordTableRecordGroupSection } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSection';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const RecordTableRecordGroupsBody = () => {
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );
  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
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
              <RecordTableBodyDroppable recordGroupId={recordGroupId}>
                {index > 0 && <RecordTableRecordGroupEmptyRow />}
                <RecordTableRecordGroupSection />
                <RecordTableRecordGroupRows />
              </RecordTableBodyDroppable>
              {isAggregateQueryEnabled && (
                <RecordTableAggregateFooter
                  key={recordGroupId}
                  currentRecordGroupId={recordGroupId}
                />
              )}
            </RecordGroupContext.Provider>
          </RecordTableRecordGroupBodyContextProvider>
        ))}
      </RecordTableBodyRecordGroupDragDropContextProvider>
    </>
  );
};
