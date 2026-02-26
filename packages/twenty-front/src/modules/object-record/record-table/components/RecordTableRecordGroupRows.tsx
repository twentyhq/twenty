import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyDroppablePlaceholder } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppablePlaceholder';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { RecordTableRecordGroupSectionAddNew } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionAddNew';
import { RecordTableRecordGroupSectionLoadMore } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionLoadMore';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableRecordGroupRows = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHide = useShouldHideRecordGroup(currentRecordGroupId);

  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const isRecordGroupTableSectionToggled = useAtomComponentFamilyStateValue(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  const rowIndexMap = useMemo(
    () => new Map(allRecordIds.map((recordId, index) => [recordId, index])),
    [allRecordIds],
  );

  if (shouldHide) {
    return null;
  }

  if (!isRecordGroupTableSectionToggled) {
    return null;
  }

  return (
    <>
      {recordIndexRecordIdsByGroup.map((recordId, rowIndexInGroup) => {
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
            isFirstRowOfGroup={rowIndexInGroup === 0}
          />
        );
      })}
      <RecordTableBodyDroppablePlaceholder />
      <RecordTableRecordGroupSectionLoadMore />
      <RecordTableRecordGroupSectionAddNew />
      <RecordTableAggregateFooter
        key={currentRecordGroupId}
        currentRecordGroupId={currentRecordGroupId}
      />
    </>
  );
};
