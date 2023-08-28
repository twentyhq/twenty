import { useRecoilValue } from 'recoil';

import type { ViewFieldDateMetadata } from '@/ui/editable-field/types/ViewField';
import { DateInputDisplay } from '@/ui/input/date/components/DateInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableDateCellEditMode } from './GenericEditableDateCellEditMode';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableDateCell({
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
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableDateCellEditMode fieldDefinition={fieldDefinition} />
      }
      nonEditModeContent={<DateInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
