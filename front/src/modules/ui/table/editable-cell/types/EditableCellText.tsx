import { ChangeEvent, useEffect, useState } from 'react';

import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { CellSkeleton } from '../components/CellSkeleton';
import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  onChange: (newValue: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  loading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function EditableCellText({
  value,
  placeholder,
  onChange,
  editModeHorizontalAlign,
  loading,
  onCancel,
  onSubmit,
}: OwnProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <InplaceInputTextEditMode
          placeholder={placeholder || ''}
          autoFocus
          value={internalValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInternalValue(event.target.value);
            onChange(event.target.value);
          }}
        />
      }
      autoComplete="off"
      onSubmit={onSubmit}
      onCancel={onCancel}
      nonEditModeContent={
        loading ? (
          <CellSkeleton />
        ) : (
          <InplaceInputTextDisplayMode>
            {internalValue}
          </InplaceInputTextDisplayMode>
        )
      }
    ></EditableCell>
  );
}
