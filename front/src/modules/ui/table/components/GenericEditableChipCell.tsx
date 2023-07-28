import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import {
  EntityFieldChipMetadata,
  EntityFieldDefinition,
} from '../types/EntityFieldMetadata';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  fieldDefinition: EntityFieldDefinition<EntityFieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableChipCell({
  fieldDefinition,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableTextCellEditMode
          fieldName={fieldDefinition.metadata.contentFieldName}
          placeholder={placeholder}
        />
      }
      nonEditModeContent={
        <GenericEditableChipCellDisplayMode
          fieldDefinition={fieldDefinition}
          editModeHorizontalAlign={editModeHorizontalAlign}
          placeholder={placeholder}
        />
      }
    ></EditableCell>
  );
}
