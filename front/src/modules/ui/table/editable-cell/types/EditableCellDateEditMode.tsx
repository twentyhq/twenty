import { useRef } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { InplaceInputDate } from '@/ui/inplace-input/components/InplaceInputDate';

import { useListenClickOutside } from '../../../hooks/useListenClickOutside';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useEditableCell } from '../hooks/useEditableCell';

const EditableCellDateEditModeContainer = styled.div`
  margin-top: -1px;
  width: 100%;
`;

export type EditableDateProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export function EditableCellDateEditMode({
  value,
  onChange,
}: EditableDateProps) {
  const { closeEditableCell } = useEditableCell();

  function handleDateChange(newDate: Date) {
    onChange(newDate);

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
      <InplaceInputDate onChange={handleDateChange} value={value} />
    </EditableCellDateEditModeContainer>
  );
}
