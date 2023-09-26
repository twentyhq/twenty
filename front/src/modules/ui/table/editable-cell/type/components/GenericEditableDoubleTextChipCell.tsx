import { ViewFieldDoubleTextChipMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableDoubleTextChipCellDisplayMode } from './GenericEditableDoubleTextChipCellDisplayMode';
import { GenericEditableDoubleTextChipCellEditMode } from './GenericEditableDoubleTextChipCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCell = ({
  columnDefinition,
}: OwnProps) => (
  <EditableCell
    editHotkeyScope={{ scope: TableHotkeyScope.CellDoubleTextInput }}
    editModeContent={
      <GenericEditableDoubleTextChipCellEditMode
        columnDefinition={columnDefinition}
      />
    }
    nonEditModeContent={
      <GenericEditableDoubleTextChipCellDisplayMode
        columnDefinition={columnDefinition}
      />
    }
  ></EditableCell>
);
