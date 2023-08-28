import type { ViewFieldChipMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableChipCellEditMode } from './GenericEditableChipCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableChipCell({
  fieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableChipCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={
        <GenericEditableChipCellDisplayMode fieldDefinition={fieldDefinition} />
      }
    ></EditableCell>
  );
}
