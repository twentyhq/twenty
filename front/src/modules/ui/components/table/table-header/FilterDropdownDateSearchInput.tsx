import styled from '@emotion/styled';

import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DatePicker from '../../form/DatePicker';

export function FilterDropdownDateSearchInput() {
  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertSelectedFilter = useUpsertSelectedFilter();

  function handleChange(date: Date) {
    if (!selectedFilterInDropdown || !selectedOperandInDropdown) return;

    upsertSelectedFilter({
      field: selectedFilterInDropdown.field,
      type: selectedFilterInDropdown.type,
      value: date.toISOString(),
      operand: selectedOperandInDropdown,
      displayValue: date.toLocaleDateString(),
    });
  }

  return (
    <DatePicker
      date={new Date()}
      onChangeHandler={handleChange}
      customInput={<></>}
      customCalendarContainer={styled.div`
        top: -10px;
      `}
    />
  );
}
