import type { ViewFieldDoubleTextChipMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableDoubleTextChipCellDisplayMode } from './GenericEditableDoubleTextChipCellDisplayMode';
import { GenericEditableDoubleTextChipCellEditMode } from './GenericEditableDoubleTextChipCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldDoubleTextChipMetadata>;
};

export function GenericEditableDoubleTextChipCell({
  fieldDefinition,
}: OwnProps) {
  return (
    <EditableCell
      editHotkeyScope={{ scope: TableHotkeyScope.CellDoubleTextInput }}
      editModeContent={
        <GenericEditableDoubleTextChipCellEditMode
          fieldDefinition={fieldDefinition}
        />
      }
      nonEditModeContent={
        <GenericEditableDoubleTextChipCellDisplayMode
          fieldDefinition={fieldDefinition}
        />
      }
    ></EditableCell>
  );
}
