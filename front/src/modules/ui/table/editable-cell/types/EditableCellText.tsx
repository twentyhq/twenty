import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { CellSkeleton } from '../components/CellSkeleton';
import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  editModeHorizontalAlign?: 'left' | 'right';
  loading?: boolean;
  onSubmit?: (newText: string) => void;
};

export function EditableCellText({
  value,
  placeholder,
  editModeHorizontalAlign,
  loading,
  onSubmit,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <InplaceInputTextEditMode
          placeholder={placeholder || ''}
          autoFocus
          value={value}
          onSubmit={(newText) => onSubmit?.(newText)}
        />
      }
      nonEditModeContent={
        loading ? (
          <CellSkeleton />
        ) : (
          <InplaceInputTextDisplayMode>{value}</InplaceInputTextDisplayMode>
        )
      }
    ></EditableCell>
  );
}
