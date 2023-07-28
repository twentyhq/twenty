import { useRecoilValue } from 'recoil';

import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { ViewFieldDefinition, ViewFieldTextMetadata } from '../types/ViewField';

import { GenericEditableTextCellEditMode } from './GenericEditableTextCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldTextMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableTextCell({
  viewField,
  editModeHorizontalAlign,
  placeholder,
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
        <GenericEditableTextCellEditMode
          fieldName={viewField.metadata.fieldName}
          viewFieldId={viewField.id}
          placeholder={placeholder}
        />
      }
      nonEditModeContent={
        <InplaceInputTextDisplayMode>{fieldValue}</InplaceInputTextDisplayMode>
      }
    ></EditableCell>
  );
}
