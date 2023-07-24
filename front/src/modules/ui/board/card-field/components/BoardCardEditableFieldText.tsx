import { ChangeEvent, useMemo, useState } from 'react';

import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { StyledInput } from '@/ui/inplace-input/components/InplaceInputTextEditMode';
import { debounce } from '~/utils/debounce';

import { BoardCardEditableField } from './BoardCardEditableField';

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
        <StyledInput
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
