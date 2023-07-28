import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

import { GenericEditableRelationCellDisplayMode } from './GenericEditableRelationCellDisplayMode';
import { GenericEditableRelationCellEditMode } from './GenericEditableRelationCellEditMode';

type OwnProps = {
  fieldMetadata: EntityFieldMetadata;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableRelationCell({
  fieldMetadata,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) {
  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
      editModeContent={
        <GenericEditableRelationCellEditMode fieldMetadata={fieldMetadata} />
      }
      nonEditModeContent={
        <GenericEditableRelationCellDisplayMode
          fieldMetadata={fieldMetadata}
          editModeHorizontalAlign={editModeHorizontalAlign}
          placeholder={placeholder}
        />
      }
    ></EditableCell>
  );
}
