import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from '@/ui/object/object-filter-dropdown/components/MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateSearchInput } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownDateSearchInput';
import { ObjectFilterDropdownNumberSearchInput } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownNumberSearchInput';
import { ObjectFilterDropdownTextSearchInput } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownTextSearchInput';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import SortOrFilterChip from '@/views/components/SortOrFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { ObjectFilterDropdownEntitySearchInput } from './ObjectFilterDropdownEntitySearchInput';
import { ObjectFilterDropdownEntitySelect } from './ObjectFilterDropdownEntitySelect';

export const EditObjectFilter = ({
  fieldMetadataId,
  label,
  iconName,
  value,
  displayValue,
}: {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  value: string;
  displayValue: string;
}) => {
  const {
    availableFilterDefinitions,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    selectFilter,
  } = useFilterDropdown();

  const { removeViewFilter } = useViewBar();
  const { icons } = useLazyLoadIcons();

  const dropdownScopeId = `filter-${fieldMetadataId}`;

  const availableFilter = availableFilterDefinitions.find(
    (filter) => filter.fieldMetadataId === fieldMetadataId,
  ) as FilterDefinition;

  const handleClick = () => {
    setFilterDefinitionUsedInDropdown(availableFilter);
    const defaultOperand = getOperandsForFilterType(availableFilter?.type)[0];
    setSelectedOperandInDropdown(defaultOperand);
    setObjectFilterDropdownSearchInput(value);

    selectFilter?.({
      fieldMetadataId,
      value,
      operand: defaultOperand,
      displayValue,
      definition: availableFilter,
    });
  };

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <Dropdown
        dropdownHotkeyScope={{ scope: dropdownScopeId }}
        clickableComponent={
          <SortOrFilterChip
            key={fieldMetadataId}
            testId={fieldMetadataId}
            labelValue={label}
            Icon={icons[iconName]}
            onRemove={() => removeViewFilter(fieldMetadataId)}
            onClick={handleClick}
          />
        }
        dropdownComponents={
          <>
            {['TEXT', 'EMAIL', 'PHONE', 'FULL_NAME', 'LINK'].includes(
              availableFilter?.type,
            ) && <ObjectFilterDropdownTextSearchInput />}
            {['NUMBER', 'CURRENCY'].includes(availableFilter?.type) && (
              <ObjectFilterDropdownNumberSearchInput />
            )}
            {availableFilter?.type === 'DATE_TIME' && (
              <ObjectFilterDropdownDateSearchInput />
            )}
            {availableFilter?.type === 'RELATION' && (
              <ObjectFilterDropdownEntitySearchInput />
            )}
            {availableFilter?.type === 'RELATION' && (
              <ObjectFilterDropdownEntitySelect />
            )}
          </>
        }
      />
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={availableFilter?.type}
      />
    </DropdownScope>
  );
};
