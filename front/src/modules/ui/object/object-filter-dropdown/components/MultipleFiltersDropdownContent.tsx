import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useViewGetStates } from '@/views/hooks/useViewGetStates';
import { activeViewBarFilterState } from '@/views/states/activeViewBarFilterState';

import { useFilter } from '../hooks/useFilter';

import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateSearchInput } from './ObjectFilterDropdownDateSearchInput';
import { ObjectFilterDropdownEntitySearchInput } from './ObjectFilterDropdownEntitySearchInput';
import { ObjectFilterDropdownEntitySelect } from './ObjectFilterDropdownEntitySelect';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownNumberSearchInput } from './ObjectFilterDropdownNumberSearchInput';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownTextSearchInput } from './ObjectFilterDropdownTextSearchInput';

export const MultipleFiltersDropdownContent = () => {
  const {
    isObjectFilterDropdownOperandSelectUnfolded,
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  } = useFilter();

  const { currentViewFilters } = useViewGetStates();

  const activeViewBarFilter = useRecoilValue(activeViewBarFilterState);

  const activeFilterInViewBar = activeViewBarFilter
    ? currentViewFilters?.find(
        (filter) => filter.fieldId === activeViewBarFilter,
      )
    : undefined;

  const activeFilterOperand = activeFilterInViewBar?.operand;

  useEffect(() => {
    if (activeFilterInViewBar) {
      setFilterDefinitionUsedInDropdown(activeFilterInViewBar.definition);
      if (activeFilterOperand) {
        setSelectedOperandInDropdown(activeFilterOperand);
      }
    }
  }, [
    activeFilterInViewBar,
    activeFilterOperand,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  ]);

  return (
    <>
      {!filterDefinitionUsedInDropdown ? (
        <ObjectFilterDropdownFilterSelect />
      ) : isObjectFilterDropdownOperandSelectUnfolded ? (
        <ObjectFilterDropdownOperandSelect />
      ) : (
        selectedOperandInDropdown && (
          <>
            <ObjectFilterDropdownOperandButton />
            <DropdownMenuSeparator />
            {filterDefinitionUsedInDropdown.type === 'text' && (
              <ObjectFilterDropdownTextSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'number' && (
              <ObjectFilterDropdownNumberSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'date' && (
              <ObjectFilterDropdownDateSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <ObjectFilterDropdownEntitySearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <ObjectFilterDropdownEntitySelect />
            )}
          </>
        )
      )}
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={
          filterDefinitionUsedInDropdown?.type
        }
      />
    </>
  );
};
