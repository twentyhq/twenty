import { useRecoilValue } from 'recoil';

import { InplaceInputDateDisplayMode } from '@/ui/display/component/InplaceInputDateDisplayMode';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { ViewFieldDateMetadata, ViewFieldDefinition } from '../types/ViewField';

import { GenericEditableDateCellEditMode } from './GenericEditableDateCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableDateCell({
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
        <GenericEditableDateCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<InplaceInputDateDisplayMode value={fieldValue} />}
    ></EditableCell>
  );
}
