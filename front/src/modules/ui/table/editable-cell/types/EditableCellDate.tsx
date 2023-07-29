import { InplaceInputDateDisplayMode } from '@/ui/display/component/InplaceInputDateDisplayMode';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { EditableCell } from '../components/EditableCell';

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
        <EditableCellDateEditMode onSubmit={onChange} value={value} />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={value} />}
      editHotkeyScope={{ scope: TableHotkeyScope.CellDateEditMode }}
    ></EditableCell>
  );
}
