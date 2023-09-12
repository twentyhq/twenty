import { Context } from 'react';
import styled from '@emotion/styled';

import DatePicker from '@/ui/input/components/DatePicker';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useUpsertFilter } from '@/ui/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';

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
      key: filterDefinitionUsedInDropdown.key,
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
