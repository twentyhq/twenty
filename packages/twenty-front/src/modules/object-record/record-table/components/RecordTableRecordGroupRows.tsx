import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { RecordTableRecordGroupEndDropZone } from '@/object-record/record-table/components/RecordTableRecordGroupEndDropZone';
import { RecordTableRecordGroupRowList } from '@/object-record/record-table/components/RecordTableRecordGroupRowList';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRecordGroupSectionAddNew } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionAddNew';
import { RecordTableRecordGroupSectionLoadMore } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionLoadMore';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

export const RecordTableRecordGroupRows = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHide = useShouldHideRecordGroup(currentRecordGroupId);

  const isRecordGroupTableSectionToggled = useAtomComponentFamilyStateValue(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  if (shouldHide) {
    return null;
  }

  if (!isRecordGroupTableSectionToggled) {
    return null;
  }

  return (
    <>
      <RecordTableRecordGroupRowList />
      <RecordTableRecordGroupEndDropZone>
        <RecordTableRecordGroupSectionLoadMore />
        <RecordTableRecordGroupSectionAddNew />
      </RecordTableRecordGroupEndDropZone>
      <RecordTableAggregateFooter
        key={currentRecordGroupId}
        currentRecordGroupId={currentRecordGroupId}
      />
    </>
  );
};
