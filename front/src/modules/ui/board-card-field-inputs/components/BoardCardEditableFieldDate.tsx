import { BoardCardEditableField } from '@/ui/board-card-field/components/BoardCardEditableField';
import { InplaceInputDateDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputDateDisplayMode';

import { BoardCardEditableFieldDateEditMode } from './BoardCardEditableFieldDateEditMode';

type OwnProps = {
  value: Date;
  onChange: (newValue: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function BoardCardEditableFieldDate({
  value,
  onChange,
  editModeHorizontalAlign,
}: OwnProps) {
  return (
    <BoardCardEditableField
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <BoardCardEditableFieldDateEditMode value={value} onChange={onChange} />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={value} />}
    ></BoardCardEditableField>
  );
}
