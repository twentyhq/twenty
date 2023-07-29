import { useRecoilValue } from 'recoil';

import { InplaceInputPhoneDisplayMode } from '@/ui/display/component/InplaceInputPhoneDisplayMode';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import {
  ViewFieldDefinition,
  ViewFieldPhoneMetadata,
} from '../types/ViewField';

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
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditablePhoneCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<InplaceInputPhoneDisplayMode value={fieldValue} />}
    ></EditableCell>
  );
}
