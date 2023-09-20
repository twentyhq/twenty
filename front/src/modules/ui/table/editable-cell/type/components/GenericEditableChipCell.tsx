import { FieldChipMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableChipCellEditMode } from './GenericEditableChipCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableChipCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => (
  <EditableCell
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
  ></EditableCell>
);
