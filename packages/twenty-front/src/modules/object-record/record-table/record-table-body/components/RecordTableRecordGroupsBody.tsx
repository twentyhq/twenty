import { useRecoilCallback } from 'recoil';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
import { RecordTableRecordGroupRows } from '@/object-record/record-table/components/RecordTableRecordGroupRows';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTableBodyRecordGroupDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDragDropContextProvider';
import { RecordTableBodyRecordGroupDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDroppable';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableRecordGroupSection } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSection';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
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

  const shouldHideEmptyRecordGroups = useRecoilComponentValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const getFilteredRecordGroupIds = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (!shouldHideEmptyRecordGroups) {
          return visibleRecordGroupIds;
        }

        return visibleRecordGroupIds.filter((recordGroupId) => {
          const recordIdsByGroup = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupFamilyState(recordGroupId),
          );

          return recordIdsByGroup.length > 0;
        });
      },
    [
      shouldHideEmptyRecordGroups,
      visibleRecordGroupIds,
      recordIndexRecordIdsByGroupFamilyState,
    ],
  );

  const filteredGroupIds = getFilteredRecordGroupIds();

  if (isRecordTableInitialLoading && allRecordIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <>
      <RecordTableBodyRecordGroupDragDropContextProvider>
        {filteredGroupIds.map((recordGroupId, index) => (
          <RecordTableRecordGroupBodyContextProvider
            recordGroupId={recordGroupId}
            key={recordGroupId}
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
