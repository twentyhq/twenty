import { useRecoilValue } from 'recoil';

import type { ViewFieldNumberMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableNumberCellEditMode } from './GenericEditableNumberCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldNumberMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableNumberCell({
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
        <GenericEditableNumberCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={<>{fieldValue}</>}
    ></EditableCell>
  );
}
