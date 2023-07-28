import { useRecoilValue } from 'recoil';

import { InplaceInputTextDisplayMode } from '@/ui/display/component/InplaceInputTextDisplayMode';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import {
  ViewFieldDefinition,
  ViewFieldDoubleTextMetadata,
} from '../types/ViewField';

import { GenericEditableDoubleTextCellEditMode } from './GenericEditableDoubleTextCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDoubleTextMetadata>;
};

export function GenericEditableDoubleTextCell({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const firstValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.firstValueFieldName,
    }),
  );

  const secondValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.secondValueFieldName,
    }),
  );

  const displayName = `${firstValue ?? ''} ${secondValue ?? ''}`;

  return (
    <EditableCell
      editModeContent={
        <GenericEditableDoubleTextCellEditMode viewField={viewField} />
      }
      nonEditModeContent={
        <InplaceInputTextDisplayMode>{displayName}</InplaceInputTextDisplayMode>
      }
    ></EditableCell>
  );
}
