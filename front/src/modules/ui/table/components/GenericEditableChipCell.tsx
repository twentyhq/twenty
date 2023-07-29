import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import { ViewFieldChipMetadata, ViewFieldDefinition } from '../types/ViewField';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableChipCellEditMode } from './GenericEditableChipCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableChipCell({
  viewField,
  editModeHorizontalAlign,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableChipCellEditMode viewField={viewField} />
      }
      nonEditModeContent={
        <GenericEditableChipCellDisplayMode fieldDefinition={viewField} />
      }
    ></EditableCell>
  );
}
