import { FieldRelationMetadata } from '@/ui/field/types/FieldMetadata';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableRelationCellDisplayMode } from './GenericEditableRelationCellDisplayMode';
import { GenericEditableRelationCellEditMode } from './GenericEditableRelationCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldRelationMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableRelationCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) => (
  <TableCellContainer
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
  ></TableCellContainer>
);
