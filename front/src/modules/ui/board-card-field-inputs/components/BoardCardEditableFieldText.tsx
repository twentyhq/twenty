import { ChangeEvent } from 'react';

import { BoardCardEditableField } from '@/ui/board-card-field/components/BoardCardEditableField';
import { InplaceInputTextDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';

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
  return (
    <BoardCardEditableField
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <InplaceInputTextEditMode
          placeholder={placeholder || ''}
          autoFocus
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <InplaceInputTextDisplayMode>{value}</InplaceInputTextDisplayMode>
      }
    ></BoardCardEditableField>
  );
}
