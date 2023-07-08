import { ChangeEvent, useState } from 'react';

import { BoardCardEditableField } from '@/ui/board-card-field/components/BoardCardEditableField';
import { InplaceInputDateDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputDateDisplayMode';
import { InplaceInputDateEditMode } from '@/ui/inplace-inputs/components/InplaceInputDateEditMode';
import { InplaceInputTextDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';

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
  const [internalValue, setInternalValue] = useState(value);

  return (
    <BoardCardEditableField
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <BoardCardEditableFieldDateEditMode
          value={internalValue}
          onChange={(newDate: Date) => {
            setInternalValue(newDate);
            onChange(newDate);
          }}
        />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={internalValue} />}
    ></BoardCardEditableField>
  );
}
