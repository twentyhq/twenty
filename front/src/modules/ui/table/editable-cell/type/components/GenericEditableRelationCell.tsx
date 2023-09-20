import { FieldRelationMetadata } from '@/ui/field/types/FieldMetadata';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableRelationCellDisplayMode } from './GenericEditableRelationCellDisplayMode';
import { GenericEditableRelationCellEditMode } from './GenericEditableRelationCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldRelationMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableRelationCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) => (
  <EditableCell
    maxContentWidth={160}
    editModeHorizontalAlign={editModeHorizontalAlign}
    editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
    editModeContent={
      <GenericEditableRelationCellEditMode
        viewFieldDefinition={viewFieldDefinition}
      />
    }
    nonEditModeContent={
      <GenericEditableRelationCellDisplayMode
        viewFieldDefinition={viewFieldDefinition}
        editModeHorizontalAlign={editModeHorizontalAlign}
        placeholder={placeholder}
      />
    }
  ></EditableCell>
);
