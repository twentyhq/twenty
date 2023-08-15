import { useRecoilValue } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldURLMetadata,
} from '@/ui/editable-field/types/ViewField';
import { InplaceInputURLDisplayMode } from '@/ui/input/url/components/URLTextInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { sanitizeURL } from '~/utils';

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
      useEditButton
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={<GenericEditableURLCellEditMode viewField={viewField} />}
      nonEditModeContent={
        <InplaceInputURLDisplayMode value={sanitizeURL(fieldValue)} />
      }
    ></EditableCell>
  );
}
