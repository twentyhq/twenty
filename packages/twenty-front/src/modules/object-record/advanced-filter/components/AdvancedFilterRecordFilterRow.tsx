import { AdvancedFilterDropdownRow } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownRow';
import { AdvancedFilterFieldSelectDrodownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDrodownButton';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterValueInputDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButton';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const AdvancedFilterRecordFilterRow = ({
  recordFilterGroup,
  recordFilter,
  recordFilterIndex,
}: {
  recordFilterGroup: RecordFilterGroup;
  recordFilter: RecordFilter;
  recordFilterIndex: number;
}) => {
  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{ instanceId: `advanced-filter-${recordFilter.id}` }}
    >
      <AdvancedFilterDropdownRow>
        <AdvancedFilterLogicalOperatorCell
          index={recordFilterIndex}
          recordFilterGroup={recordFilterGroup}
        />
        <AdvancedFilterFieldSelectDrodownButton
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterValueInputDropdownButton
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterRecordFilterOptionsDropdown
          recordFilterId={recordFilter.id}
        />
      </AdvancedFilterDropdownRow>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
