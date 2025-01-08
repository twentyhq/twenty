import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordIndexAddRecordInGroupDropdown } from '@/object-record/record-index/components/RecordIndexAddRecordInGroupDropdown';
import { RecordIndexPageTableAddButtonNoGroup } from '@/object-record/record-index/components/RecordIndexPageTableAddButtonNoGroup';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordIndexPageTableAddButton = () => {
  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
  );

  if (!hasRecordGroups) {
    return <RecordIndexPageTableAddButtonNoGroup />;
  }

  return (
    <RecordIndexAddRecordInGroupDropdown
      dropdownId="record-index-page-table-add-button-dropdown"
      clickableComponent={<PageAddButton />}
    />
  );
};
