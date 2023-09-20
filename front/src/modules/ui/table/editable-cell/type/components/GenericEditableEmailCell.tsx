import { useRecoilValue } from 'recoil';

import { EmailDisplay } from '@/ui/content-display/components/EmailDisplay';
import { FieldEmailMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableEmailCellEditMode } from './GenericEditableEmailCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldEmailMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableEmailCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableEmailCellEditMode
          columnDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<EmailDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
