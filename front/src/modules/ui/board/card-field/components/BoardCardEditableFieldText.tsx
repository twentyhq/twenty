import { ChangeEvent, useMemo, useState } from 'react';

import { TextInputDisplay } from '@/ui/input/text/components/TextInputDisplay';
import { StyledInput } from '@/ui/table/editable-cell/type/components/TextCellEdit';
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
          autoComplete="off"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInternalValue(event.target.value);
            debouncedOnChange(event.target.value);
          }}
        />
      }
      nonEditModeContent={<TextInputDisplay>{value}</TextInputDisplay>}
    ></BoardCardEditableField>
  );
}
