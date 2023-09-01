import { useRecoilValue } from 'recoil';

import type { ViewFieldPhoneMetadata } from '@/ui/editable-field/types/ViewField';
import { PhoneInputDisplay } from '@/ui/input/phone/components/PhoneInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditablePhoneCellEditMode } from './GenericEditablePhoneCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldPhoneMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditablePhoneCell({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
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
        <GenericEditablePhoneCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={<PhoneInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
