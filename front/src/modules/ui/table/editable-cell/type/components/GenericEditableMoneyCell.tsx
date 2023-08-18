import { useRecoilValue } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldMoneyMetadata,
} from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { GenericEditableMoneyCellEditMode } from './GenericEditableMoneyCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldMoneyMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableMoneyCell({
  viewField,
  editModeHorizontalAlign,
}: OwnProps) {
  function formatNumber(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<number>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableMoneyCellEditMode viewField={viewField} />
      }
      nonEditModeContent={
        <>{fieldValue ? `$${formatNumber(fieldValue)}` : ''}</>
      }
    ></EditableCell>
  );
}
