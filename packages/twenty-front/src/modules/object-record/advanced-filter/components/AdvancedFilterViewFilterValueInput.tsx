import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

type AdvancedFilterViewFilterValueInputProps = {
  viewFilterId: string;
};

export const AdvancedFilterViewFilterValueInput = ({
  viewFilterId,
}: AdvancedFilterViewFilterValueInputProps) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${viewFilterId}`;

  const filter = useCurrentViewFilter({ viewFilterId });

  const isDisabled = !filter?.fieldMetadataId || !filter.operand;

  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
  );

  if (isDisabled) {
    return (
      <SelectControl
        isDisabled
        selectedOption={{
          label: filter?.displayValue ?? '',
          value: null,
        }}
      />
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label: filter?.displayValue ?? '',
            value: null,
          }}
        />
      }
      onOpen={() => {
        setFilterDefinitionUsedInDropdown(filter.definition);
        setSelectedOperandInDropdown(filter.operand);
        setSelectedFilter(filter);
      }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <ObjectFilterDropdownFilterInput />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={280}
    />
  );
};
