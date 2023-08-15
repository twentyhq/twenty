import { useRef } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { DateInputEdit } from '@/ui/input/date/components/DateInputEdit';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useEditableCell } from '../../hooks/useEditableCell';

const StyledEditableCellDateEditModeContainer = styled.div`
  margin-top: -1px;
  width: 100%;
`;

export type DateCellEditProps = {
  value: Date;
  onSubmit: (date: Date) => void;
};

export function DateCellEdit({ value, onSubmit }: DateCellEditProps) {
  const { closeEditableCell } = useEditableCell();

  function handleDateChange(newDate: Date) {
    onSubmit(newDate);

    closeEditableCell();
  }

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeEditableCell();
    },
    TableHotkeyScope.CellDateEditMode,
    [closeEditableCell],
  );

  const containerRef = useRef(null);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      closeEditableCell();
    },
  });

  return (
    <StyledEditableCellDateEditModeContainer ref={containerRef}>
      <DateInputEdit onChange={handleDateChange} value={value} />
    </StyledEditableCellDateEditModeContainer>
  );
}
