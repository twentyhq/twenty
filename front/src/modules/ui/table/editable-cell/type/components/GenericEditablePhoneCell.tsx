import { useRecoilValue } from 'recoil';

import type { ViewFieldPhoneMetadata } from '@/ui/editable-field/types/ViewField';
import { PhoneInputDisplay } from '@/ui/input/phone/components/PhoneInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditablePhoneCellEditMode } from './GenericEditablePhoneCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldPhoneMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditablePhoneCell({
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
        <GenericEditablePhoneCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={<PhoneInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
