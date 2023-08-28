import { useRecoilValue } from 'recoil';

import type { ViewFieldEmailMetadata } from '@/ui/editable-field/types/ViewField';
import { EmailInputDisplay } from '@/ui/input/email/components/EmailInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableEmailCellEditMode } from './GenericEditableEmailCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldEmailMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableEmailCell({
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
        <GenericEditableEmailCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={<EmailInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
