import { useRecoilValue } from 'recoil';

import type { ViewFieldMoneyMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableMoneyCellEditMode } from './GenericEditableMoneyCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldMoneyMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

function formatNumber(value: number) {
  // Formats the value to a string and add commas to it ex: 50,000 | 500,000
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function GenericEditableMoneyCell({
  columnDefinition,
  editModeHorizontalAlign,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<number>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableMoneyCellEditMode columnDefinition={columnDefinition} />
      }
      nonEditModeContent={
        <>{fieldValue ? `$${formatNumber(fieldValue)}` : ''}</>
      }
    ></EditableCell>
  );
}
