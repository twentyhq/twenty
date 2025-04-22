import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/hooks/useDefaultFieldMetadataItemForFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { getAdvancedFilterAddFilterRuleSelectDropdownId } from '@/object-record/advanced-filter/utils/getAdvancedFilterAddFilterRuleSelectDropdownId';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined } from 'twenty-shared/utils';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

type AdvancedFilterAddFilterRuleSelectProps = {
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterAddFilterRuleSelect = ({
  recordFilterGroup,
}: AdvancedFilterAddFilterRuleSelectProps) => {
  const dropdownId = getAdvancedFilterAddFilterRuleSelectDropdownId(
    recordFilterGroup.id,
  );

  const { currentView } = useGetCurrentViewOnly();

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { lastChildPosition } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: recordFilterGroup.id,
  });

  const newPositionInRecordFilterGroup = lastChildPosition + 1;

  const { closeDropdown } = useDropdown(dropdownId);

  const { defaultFieldMetadataItemForFilter } =
    useDefaultFieldMetadataItemForFilter();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const handleAddFilter = () => {
    if (!isDefined(defaultFieldMetadataItemForFilter)) {
      throw new Error('Missing default field metadata item for filter');
    }

    closeDropdown();

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForFilter.type,
    );

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForFilter.id,
      type: filterType,
      operand: getRecordFilterOperands({
        filterType,
      })[0],
      value: '',
      displayValue: '',
      recordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: newPositionInRecordFilterGroup,
      label: defaultFieldMetadataItemForFilter.label,
    };

    upsertRecordFilter(newRecordFilter);

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const handleAddFilterGroup = () => {
    closeDropdown();

    if (!isDefined(defaultFieldMetadataItemForFilter)) {
      throw new Error('Missing default field metadata item for filter');
    }

    if (!isDefined(currentView)) {
      throw new Error('Missing view');
    }

    const newRecordFilterGroupId = v4();

    const newRecordFilterGroup: RecordFilterGroup = {
      id: newRecordFilterGroupId,
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId: recordFilterGroup.id,
      positionInRecordFilterGroup: newPositionInRecordFilterGroup,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    const filterType = getFilterTypeFromFieldType(
      defaultFieldMetadataItemForFilter.type,
    );

    const newRecordFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: defaultFieldMetadataItemForFilter.id,
      type: filterType,
      operand: getRecordFilterOperands({
        filterType,
      })[0],
      value: '',
      displayValue: '',
      recordFilterGroupId: newRecordFilterGroupId,
      positionInRecordFilterGroup: 1,
      label: defaultFieldMetadataItemForFilter.label,
    };

    upsertRecordFilter(newRecordFilter);

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    recordFilterGroup.parentRecordFilterGroupId,
  );

  if (!isFilterRuleGroupOptionVisible) {
    return (
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightButton Icon={IconPlus} title="Add filter rule" />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconPlus}
            text="Add rule"
            onClick={handleAddFilter}
          />
          {isFilterRuleGroupOptionVisible && (
            <MenuItem
              LeftIcon={IconLibraryPlus}
              text="Add rule group"
              onClick={handleAddFilterGroup}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
