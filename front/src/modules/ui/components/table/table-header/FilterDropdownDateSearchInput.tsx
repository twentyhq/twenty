import styled from '@emotion/styled';

import { useUpsertActiveTableFilter } from '@/filters-and-sorts/hooks/useUpsertActiveTableFilter';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DatePicker from '../../form/DatePicker';

export function FilterDropdownDateSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertActiveTableFilter();

  function handleChange(date: Date) {
    if (!tableFilterDefinitionUsedInDropdown || !selectedOperandInDropdown)
      return;

    upsertActiveTableFilter({
      field: tableFilterDefinitionUsedInDropdown.field,
      type: tableFilterDefinitionUsedInDropdown.type,
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
