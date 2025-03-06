import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { isRecordFilterGroupChildARecordFilter } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilter';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

type AdvancedFilterRecordFilterGroupChildOptionsDropdownProps = {
  recordFilterGroupChild: RecordFilter | RecordFilterGroup;
};

export const AdvancedFilterRecordFilterGroupChildOptionsDropdown = ({
  recordFilterGroupChild,
}: AdvancedFilterRecordFilterGroupChildOptionsDropdownProps) => {
  const isRecordFilter = isRecordFilterGroupChildARecordFilter(
    recordFilterGroupChild,
  );

  return isRecordFilter ? (
    <AdvancedFilterRecordFilterOptionsDropdown
      recordFilterId={recordFilterGroupChild.id}
    />
  ) : (
    <AdvancedFilterRecordFilterGroupOptionsDropdown
      recordFilterGroupId={recordFilterGroupChild.id}
    />
  );
};
