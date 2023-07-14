import { ChangeEvent, useEffect, useState } from 'react';

import { InplaceInputTextDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';

import { CellSkeleton } from '../CellSkeleton';
import { EditableCell } from '../EditableCell';

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
