import { useRecoilValue } from 'recoil';

import { PhoneDisplay } from '@/ui/content-display/components/PhoneDisplay';
import { ViewFieldPhoneMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { type ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditablePhoneCellEditMode } from './GenericEditablePhoneCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldPhoneMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditablePhoneCell = ({
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
        <GenericEditablePhoneCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={<PhoneDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
