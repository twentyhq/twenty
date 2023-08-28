import type { ViewFieldRelationMetadata } from '@/ui/editable-field/types/ViewField';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableRelationCellDisplayMode } from './GenericEditableRelationCellDisplayMode';
import { GenericEditableRelationCellEditMode } from './GenericEditableRelationCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldRelationMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableRelationCell({
  fieldDefinition,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) {
  return (
    <EditableCell
      maxContentWidth={160}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
      editModeContent={
        <GenericEditableRelationCellEditMode
          fieldDefinition={fieldDefinition}
        />
      }
      nonEditModeContent={
        <GenericEditableRelationCellDisplayMode
          fieldDefinition={fieldDefinition}
          editModeHorizontalAlign={editModeHorizontalAlign}
          placeholder={placeholder}
        />
      }
    ></EditableCell>
  );
}
