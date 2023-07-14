import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { InplaceInputDateEditMode } from '@/ui/inplace-inputs/components/InplaceInputDateEditMode';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

import { useEditableCell } from '../hooks/useEditableCell';

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

  return <InplaceInputDateEditMode onChange={handleDateChange} value={value} />;
}
