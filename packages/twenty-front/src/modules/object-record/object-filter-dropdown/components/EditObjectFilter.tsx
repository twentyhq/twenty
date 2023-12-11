import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateSearchInput';
import { ObjectFilterDropdownNumberSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberSearchInput';
import { ObjectFilterDropdownOperandButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownTextSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextSearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import SortOrFilterChip from '@/views/components/SortOrFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { ObjectFilterDropdownRecordSearchInput } from './ObjectFilterDropdownEntitySearchInput';

export const EditObjectFilter = ({
  fieldMetadataId,
  label,
  iconName,
  value,
  displayValue,
  filterDropdownId,
}: {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  value: string;
  displayValue: string;
  filterDropdownId?: string;
}) => {
  const {
    availableFilterDefinitions,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    selectFilter,
    isObjectFilterDropdownOperandSelectUnfolded,
  } = useFilterDropdown({ filterDropdownId });

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
    setIsObjectFilterDropdownOperandSelectUnfolded(false);

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
          isObjectFilterDropdownOperandSelectUnfolded ? (
            <ObjectFilterDropdownOperandSelect
              filterDropdownId={filterDropdownId}
            />
          ) : (
            <>
              <ObjectFilterDropdownOperandButton
                filterDropdownId={filterDropdownId}
              />
              <DropdownMenuSeparator />
              {['TEXT', 'EMAIL', 'PHONE', 'FULL_NAME', 'LINK'].includes(
                availableFilter?.type,
              ) && (
                <ObjectFilterDropdownTextSearchInput
                  filterDropdownId={filterDropdownId}
                />
              )}
              {['NUMBER', 'CURRENCY'].includes(availableFilter?.type) && (
                <ObjectFilterDropdownNumberSearchInput
                  filterDropdownId={filterDropdownId}
                />
              )}
              {availableFilter?.type === 'DATE_TIME' && (
                <ObjectFilterDropdownDateSearchInput
                  filterDropdownId={filterDropdownId}
                />
              )}
              {availableFilter?.type === 'RELATION' && (
                <>
                  <ObjectFilterDropdownRecordSearchInput
                    filterDropdownId={filterDropdownId}
                  />
                  <DropdownMenuSeparator />
                  <ObjectFilterDropdownRecordSelect
                    filterDropdownId={filterDropdownId}
                  />
                </>
              )}
            </>
          )
        }
      />
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={availableFilter?.type}
      />
    </DropdownScope>
  );
};
