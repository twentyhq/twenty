import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import { ViewFieldChipMetadata, ViewFieldDefinition } from '../types/ViewField';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableChipCell({
  viewField,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableTextCellEditMode
          fieldName={viewField.metadata.contentFieldName}
          viewFieldId={viewField.id}
          placeholder={placeholder}
        />
      }
      nonEditModeContent={
        <GenericEditableChipCellDisplayMode fieldDefinition={viewField} />
      }
    ></EditableCell>
  );
}
