import { ChangeEvent } from 'react';
import styled from '@emotion/styled';

import { useRemoveSelectedFilter } from '@/filters-and-sorts/hooks/useRemoveSelectedFilter';
import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DatePicker from '../../form/DatePicker';

export function FilterDropdownNumberSearchInput() {
  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertSelectedFilter = useUpsertSelectedFilter();
  const removeSelectedFilter = useRemoveSelectedFilter();

  return (
    selectedFilterInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="number"
        placeholder={selectedFilterInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.value === '') {
            removeSelectedFilter(selectedFilterInDropdown.field);
          } else {
            upsertSelectedFilter({
              field: selectedFilterInDropdown.field,
              type: selectedFilterInDropdown.type,
              value: event.target.value,
              operand: selectedOperandInDropdown,
              displayValue: event.target.value,
            });
          }
        }}
      />
    )
  );
}
