import { InplaceInputTextCellEditMode } from '@/ui/inplace-input/components/InplaceInputTextCellEditMode';

import { RawLink } from '../../../link/components/RawLink';
import { CellSkeleton } from '../components/CellSkeleton';
import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  url: string;
  onChange?: (newURL: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  loading?: boolean;
  onSubmit?: (newURL: string) => void;
  onCancel?: () => void;
};

export function EditableCellURL({
  url,
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
          placeholder={placeholder}
          autoFocus
          value={url}
          onSubmit={(newURL) => onSubmit?.(newURL)}
        />
      }
      nonEditModeContent={
        loading ? (
          <CellSkeleton />
        ) : (
          <RawLink
            onClick={(e) => e.stopPropagation()}
            href={url ? 'https://' + url : ''}
          >
            {url}
          </RawLink>
        )
      }
    ></EditableCell>
  );
}
