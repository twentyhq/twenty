import { useRecoilValue } from 'recoil';

import { URLDisplay } from '@/ui/field/meta-types/display/content-display/components/URLDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldURLMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { sanitizeURL } from '~/utils';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableURLCellEditMode } from './GenericEditableURLCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<FieldURLMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableURLCell = ({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  return (
    <TableCellContainer
      useEditButton
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableURLCellEditMode
          viewFieldDefinition={columnDefinition}
        />
      }
      nonEditModeContent={<URLDisplay value={sanitizeURL(fieldValue)} />}
    ></TableCellContainer>
  );
};
