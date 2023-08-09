import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
} from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { GenericEditableDoubleTextChipCellDisplayMode } from './GenericEditableDoubleTextChipCellDisplayMode';
import { GenericEditableDoubleTextChipCellEditMode } from './GenericEditableDoubleTextChipCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDoubleTextChipMetadata>;
};

export function GenericEditableDoubleTextChipCell({ viewField }: OwnProps) {
  return (
    <EditableCell
      editHotkeyScope={{ scope: TableHotkeyScope.CellDoubleTextInput }}
      editModeContent={
        <GenericEditableDoubleTextChipCellEditMode viewField={viewField} />
      }
      nonEditModeContent={
        <GenericEditableDoubleTextChipCellDisplayMode viewField={viewField} />
      }
    ></EditableCell>
  );
}
