import { useRecoilValue } from 'recoil';

import type { ViewFieldTextMetadata } from '@/ui/editable-field/types/ViewField';
import { TextInputDisplay } from '@/ui/input/text/components/TextInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldTextMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableTextCell({
  fieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableTextCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={<TextInputDisplay>{fieldValue}</TextInputDisplay>}
    ></EditableCell>
  );
}
