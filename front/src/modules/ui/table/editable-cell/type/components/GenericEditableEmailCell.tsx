import { useRecoilValue } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldEmailMetadata,
} from '@/ui/editable-field/types/ViewField';
import { EmailInputDisplay } from '@/ui/input/email/components/EmailInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { GenericEditableEmailCellEditMode } from './GenericEditableEmailCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldEmailMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableEmailCell({
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
        <GenericEditableEmailCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<EmailInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
