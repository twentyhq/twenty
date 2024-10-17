import { ObjectFilterDropdownFilterSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  flex: 2;
`;

interface AdvancedFilterViewFilterFieldSelectProps {
  viewFilter: ViewFilter;
  selectedFieldLabel: string;
}

export const AdvancedFilterViewFilterFieldSelect = (
  props: AdvancedFilterViewFilterFieldSelectProps,
) => {
  const dropdownId = `advanced-filter-view-filter-field-${props.viewFilter.id}`;

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();
  const { closeDropdown } = useDropdown(dropdownId);

  const handleSelectField = (filterDefinition: FilterDefinition) => {
    closeDropdown();
    const operandsForFilterType =
      getOperandsForFilterDefinition(filterDefinition);

    upsertCombinedViewFilter({
      ...props.viewFilter,
      fieldMetadataId: filterDefinition.fieldMetadataId,
      definition: filterDefinition,
      operand: operandsForFilterType[0],
    });
  };

  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

  return (
    <StyledContainer>
      <Dropdown
        disableBlur
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label: props.selectedFieldLabel,
              value: '',
            }}
          />
        }
        dropdownComponents={
          shouldShowCompositeSelectionSubMenu ? (
            <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu
              onSelectField={handleSelectField} // This should probably be done using useFilterDropdown instead?
            />
          ) : (
            <ObjectFilterDropdownFilterSelect
              onSelectField={handleSelectField}
            />
          )
        }
        dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
