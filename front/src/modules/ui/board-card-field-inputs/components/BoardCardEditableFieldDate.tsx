import { useMemo, useState } from 'react';

import { BoardCardEditableField } from '@/ui/board-card-field/components/BoardCardEditableField';
import { InplaceInputDateDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputDateDisplayMode';
import { debounce } from '@/utils/debounce';

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
  const debouncedOnChange = useMemo(() => {
    return debounce(onChange, 200);
  }, [onChange]);
  return (
    <BoardCardEditableField
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <BoardCardEditableFieldDateEditMode
          value={internalValue}
          onChange={(date: Date) => {
            setInternalValue(date);
            debouncedOnChange(date);
          }}
        />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={value} />}
    ></BoardCardEditableField>
  );
}
