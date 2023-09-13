import { TextDisplay } from '@/ui/content-display/components/TextDisplay';
import type { ViewFieldTextMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useGenericTextFieldInContext } from '@/ui/table/hooks/useGenericTextFieldInContext';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldTextMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableTextCell({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
  const { fieldValue } = useGenericTextFieldInContext();

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableTextCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={<TextDisplay text={fieldValue} />}
    ></EditableCell>
  );
}
