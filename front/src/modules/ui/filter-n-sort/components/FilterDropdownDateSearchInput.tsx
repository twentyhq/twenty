import { Context } from 'react';
import styled from '@emotion/styled';

import { useUpsertFilter } from '@/ui/filter-n-sort/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import DatePicker from '@/ui/input/components/DatePicker';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

export function FilterDropdownDateSearchInput({
  context,
}: {
  context: Context<string | null>;
}) {
  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const upsertFilter = useUpsertFilter(context);

  function handleChange(date: Date) {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    upsertFilter({
      field: filterDefinitionUsedInDropdown.field,
      type: filterDefinitionUsedInDropdown.type,
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
