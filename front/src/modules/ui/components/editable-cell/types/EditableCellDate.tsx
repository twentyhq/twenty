import { InplaceInputDateDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputDateDisplayMode';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

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
      editHotkeyScope={{ scope: TableHotkeyScope.CellDateEditMode }}
    ></EditableCell>
  );
}
