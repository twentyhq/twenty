import { useRecoilValue } from 'recoil';

import { InplaceInputURLDisplayMode } from '@/ui/display/component/InplaceInputURLDisplayMode';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { ViewFieldDefinition, ViewFieldURLMetadata } from '../types/ViewField';

import { GenericEditableURLCellEditMode } from './GenericEditableURLCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldURLMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableURLCell({
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
      editModeContent={<GenericEditableURLCellEditMode viewField={viewField} />}
      nonEditModeContent={<InplaceInputURLDisplayMode value={fieldValue} />}
    ></EditableCell>
  );
}
