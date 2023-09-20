import { useRecoilValue } from 'recoil';

import { PhoneDisplay } from '@/ui/content-display/components/PhoneDisplay';
import { FieldPhoneMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditablePhoneCellEditMode } from './GenericEditablePhoneCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldPhoneMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditablePhoneCell = ({
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
      useEditButton
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditablePhoneCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<PhoneDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
