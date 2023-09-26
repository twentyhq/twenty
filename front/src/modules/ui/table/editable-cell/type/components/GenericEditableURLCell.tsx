import { useRecoilValue } from 'recoil';

import { URLDisplay } from '@/ui/content-display/components/URLDisplay';
import { ViewFieldURLMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { sanitizeURL } from '~/utils';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableURLCellEditMode } from './GenericEditableURLCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldURLMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableURLCell = ({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      useEditButton
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableURLCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={<URLDisplay value={sanitizeURL(fieldValue)} />}
    ></EditableCell>
  );
};
