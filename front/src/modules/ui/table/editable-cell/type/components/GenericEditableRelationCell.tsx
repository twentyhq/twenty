import type { ViewFieldRelationMetadata } from '@/ui/editable-field/types/ViewField';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableRelationCellDisplayMode } from './GenericEditableRelationCellDisplayMode';
import { GenericEditableRelationCellEditMode } from './GenericEditableRelationCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldRelationMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableRelationCell = ({
  columnDefinition,
  editModeHorizontalAlign,
  placeholder,
}: OwnProps) => (
  <EditableCell
    maxContentWidth={160}
    editModeHorizontalAlign={editModeHorizontalAlign}
    editHotkeyScope={{ scope: RelationPickerHotkeyScope.RelationPicker }}
    editModeContent={
      <GenericEditableRelationCellEditMode
        columnDefinition={columnDefinition}
      />
    }
    nonEditModeContent={
      <GenericEditableRelationCellDisplayMode
        columnDefinition={columnDefinition}
        editModeHorizontalAlign={editModeHorizontalAlign}
        placeholder={placeholder}
      />
    }
  ></EditableCell>
);
