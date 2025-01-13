import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTablePendingRecordGroupRow } from '@/object-record/record-table/record-table-row/components/RecordTablePendingRecordGroupRow';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { RecordTableRecordGroupSectionAddNew } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionAddNew';
import { RecordTableRecordGroupSectionLoadMore } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionLoadMore';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';
import { isDefined } from '~/utils/isDefined';

export const RecordTableRecordGroupRows = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const recordIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const isRecordGroupTableSectionToggled = useRecoilComponentFamilyValueV2(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  const rowIndexMap = useMemo(
    () => new Map(allRecordIds.map((recordId, index) => [recordId, index])),
    [allRecordIds],
  );

  if (!isRecordGroupTableSectionToggled) {
    return null;
  }

  return (
    <>
      {recordIdsByGroup.map((recordId, rowIndexInGroup) => {
        const rowIndex = rowIndexMap.get(recordId);

        if (!isDefined(rowIndex)) {
          return null;
        }

        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndexForFocus={rowIndex}
            rowIndexForDrag={rowIndexInGroup}
            isPendingRow={!isRecordGroupTableSectionToggled}
          />
        );
      })}
      <RecordTablePendingRecordGroupRow />
      <RecordTableRecordGroupSectionAddNew />
      <RecordTableRecordGroupSectionLoadMore />
      <RecordTableAggregateFooter
        key={currentRecordGroupId}
        currentRecordGroupId={currentRecordGroupId}
      />
    </>
  );
};
