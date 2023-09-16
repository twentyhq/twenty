import type { ViewFieldChipMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableChipCellDisplayMode } from './GenericEditableChipCellDisplayMode';
import { GenericEditableChipCellEditMode } from './GenericEditableChipCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldChipMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export const GenericEditableChipCell = ({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) => (
  <EditableCell
    editModeHorizontalAlign={editModeHorizontalAlign}
    editModeContent={
      <GenericEditableChipCellEditMode columnDefinition={columnDefinition} />
    }
    nonEditModeContent={
      <GenericEditableChipCellDisplayMode columnDefinition={columnDefinition} />
    }
  ></EditableCell>
);
