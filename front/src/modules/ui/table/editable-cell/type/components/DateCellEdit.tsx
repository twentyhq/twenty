import { useRef } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { DateInputEdit } from '@/ui/input/date/components/DateInputEdit';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/click-outside/hooks/useListenClickOutside';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { useEditableCell } from '../../hooks/useEditableCell';

const EditableCellDateEditModeContainer = styled.div`
  margin-top: -1px;
  width: 100%;
`;

export type EditableDateProps = {
  value: Date;
  onSubmit: (date: Date) => void;
};

export function DateCellEdit({ value, onSubmit }: EditableDateProps) {
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
    <EditableCellDateEditModeContainer ref={containerRef}>
      <DateInputEdit onChange={handleDateChange} value={value} />
    </EditableCellDateEditModeContainer>
  );
}
