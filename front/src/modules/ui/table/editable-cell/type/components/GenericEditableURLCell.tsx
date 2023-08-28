import { useRecoilValue } from 'recoil';

import type { ViewFieldURLMetadata } from '@/ui/editable-field/types/ViewField';
import { InplaceInputURLDisplayMode } from '@/ui/input/url/components/URLTextInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { sanitizeURL } from '~/utils';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableURLCellEditMode } from './GenericEditableURLCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldURLMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableURLCell({
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
      useEditButton
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableURLCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={
        <InplaceInputURLDisplayMode value={sanitizeURL(fieldValue)} />
      }
    ></EditableCell>
  );
}
