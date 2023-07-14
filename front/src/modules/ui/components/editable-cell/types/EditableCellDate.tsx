import { InplaceInputDateDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputDateDisplayMode';
import { HotkeyScope } from '@/ui/tables/types/HotkeyScope';

import { EditableCell } from '../EditableCell';

import { EditableCellDateEditMode } from './EditableCellDateEditMode';

export type EditableDateProps = {
  value: Date;
  onChange: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function EditableCellDate({
  value,
  onChange,
  editModeHorizontalAlign,
}: EditableDateProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <EditableCellDateEditMode onChange={onChange} value={value} />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={value} />}
      editHotkeysScope={{ scope: HotkeyScope.CellDateEditMode }}
    ></EditableCell>
  );
}
