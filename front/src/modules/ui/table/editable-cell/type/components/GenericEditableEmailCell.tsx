import { useRecoilValue } from 'recoil';

import type { ViewFieldEmailMetadata } from '@/ui/editable-field/types/ViewField';
import { EmailInputDisplay } from '@/ui/input/components/EmailInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableEmailCellEditMode } from './GenericEditableEmailCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldEmailMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableEmailCell({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableEmailCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={<EmailInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
