import { useRecoilValue } from 'recoil';

import { TextInputDisplay } from '@/ui/input/text/components/TextInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import {
  ViewFieldDefinition,
  ViewFieldTextMetadata,
} from '@/ui/table/types/ViewField';

import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldTextMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableTextCell({
  viewField,
  editModeHorizontalAlign,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableTextCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<TextInputDisplay>{fieldValue}</TextInputDisplay>}
    ></EditableCell>
  );
}
