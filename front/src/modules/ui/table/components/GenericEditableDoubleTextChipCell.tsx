import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import { TableHotkeyScope } from '../types/TableHotkeyScope';
import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
} from '../types/ViewField';

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
