import { useRecoilValue } from 'recoil';

import { EmailDisplay } from '@/ui/field/meta-types/display/content-display/components/EmailDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldEmailMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableEmailCellEditMode } from './GenericEditableEmailCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldEmailMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableEmailCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <TableCellContainer
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableEmailCellEditMode
          columnDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<EmailDisplay value={fieldValue} />}
    ></TableCellContainer>
  );
};
