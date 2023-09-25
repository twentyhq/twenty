import { FieldChipMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableChipCellEditMode } from './GenericEditableChipCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableChipCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => (
  <TableCellContainer
    editModeHorizontalAlign={editModeHorizontalAlign}
    editModeContent={
      <GenericEditableChipCellEditMode
        viewFieldDefinition={viewFieldDefinition}
      />
    }
    nonEditModeContent={
      <GenericEditableChipCellDisplayMode
        viewFieldDefinition={viewFieldDefinition}
      />
    }
  ></TableCellContainer>
);
