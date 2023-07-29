import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { InplaceInputTextCellEditMode } from '@/ui/inplace-input/components/InplaceInputTextCellEditMode';

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
        <InplaceInputTextCellEditMode
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
