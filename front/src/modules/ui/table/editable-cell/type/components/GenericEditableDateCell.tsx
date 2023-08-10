import { useRecoilValue } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';
import { DateInputDisplay } from '@/ui/input/date/components/DateInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { GenericEditableDateCellEditMode } from './GenericEditableDateCellEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableDateCell({
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
        <GenericEditableDateCellEditMode viewField={viewField} />
      }
      nonEditModeContent={<DateInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
