import { ChangeEvent, useEffect, useState } from 'react';

import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { RawLink } from '../../../link/components/RawLink';
import { CellSkeleton } from '../components/CellSkeleton';
import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  url: string;
  onChange: (newURL: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  loading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function EditableCellURL({
  url,
  placeholder,
  onChange,
  editModeHorizontalAlign,
  loading,
  onCancel,
  onSubmit,
}: OwnProps) {
  const [internalValue, setInternalValue] = useState(url);

  useEffect(() => {
    setInternalValue(url);
  }, [url]);

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <InplaceInputTextEditMode
          autoComplete="off"
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
          <RawLink
            onClick={(e) => e.stopPropagation()}
            href={internalValue ? 'https://' + internalValue : ''}
          >
            {internalValue}
          </RawLink>
        )
      }
    ></EditableCell>
  );
}
