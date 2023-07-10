import { ChangeEvent, useMemo, useState } from 'react';

import { BoardCardEditableField } from '@/ui/board-card-field/components/BoardCardEditableField';
import { InplaceInputTextDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';
import { debounce } from '@/utils/debounce';

type OwnProps = {
  placeholder?: string;
  value: string;
  onChange: (newValue: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function BoardCardEditableFieldText({
  value,
  placeholder,
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
        <InplaceInputTextEditMode
          placeholder={placeholder || ''}
          autoFocus
          value={internalValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInternalValue(event.target.value);
            debouncedOnChange(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <InplaceInputTextDisplayMode>{value}</InplaceInputTextDisplayMode>
      }
    ></BoardCardEditableField>
  );
}
