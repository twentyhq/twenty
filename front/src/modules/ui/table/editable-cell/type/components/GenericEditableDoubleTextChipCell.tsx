import { FieldDoubleTextChipMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableDoubleTextChipCellDisplayMode } from './GenericEditableDoubleTextChipCellDisplayMode';
import { GenericEditableDoubleTextChipCellEditMode } from './GenericEditableDoubleTextChipCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCell = ({
  viewFieldDefinition: columnDefinition,
}: OwnProps) => (
  <TableCellContainer
    editHotkeyScope={{ scope: TableHotkeyScope.CellDoubleTextInput }}
    editModeContent={
      <GenericEditableDoubleTextChipCellEditMode
        viewFieldDefinition={columnDefinition}
      />
    }
    nonEditModeContent={
      <GenericEditableDoubleTextChipCellDisplayMode
        viewFieldDefinition={columnDefinition}
      />
    }
  ></TableCellContainer>
);
