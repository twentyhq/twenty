import styled from '@emotion/styled';

import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DatePicker from '../../form/DatePicker';

export function FilterDropdownDateSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertFilter(TableContext);

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
