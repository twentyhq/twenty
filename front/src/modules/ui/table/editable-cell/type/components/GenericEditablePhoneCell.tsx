import { useRecoilValue } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldPhoneMetadata,
} from '@/ui/editable-field/types/ViewField';
import { PhoneInputDisplay } from '@/ui/input/phone/components/PhoneInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { GenericEditablePhoneCellEditMode } from './GenericEditablePhoneCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldPhoneMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditablePhoneCell({
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
      editModeContent={
        <GenericEditablePhoneCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<PhoneInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
