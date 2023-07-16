import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { InplaceInputDate } from '@/ui/inplace-inputs/components/InplaceInputDate';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

import { useEditableCell } from '../hooks/useEditableCell';

const EditableCellDateEditModeContainer = styled.div`
  margin-top: -1px;
  width: inherit;
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

  return (
    <EditableCellDateEditModeContainer>
      <InplaceInputDate onChange={handleDateChange} value={value} />
    </EditableCellDateEditModeContainer>
  );
}
