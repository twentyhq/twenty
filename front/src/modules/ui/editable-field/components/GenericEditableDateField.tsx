import { useRecoilValue } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';
import { DateInputDisplay } from '@/ui/input/date/components/DateInputDisplay';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { GenericEditableDateFieldEditMode } from './GenericEditableDateFieldEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function GenericEditableDateField({
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
        <GenericEditableDateFieldEditMode viewField={viewField} />
      }
      nonEditModeContent={<DateInputDisplay value={fieldValue} />}
    ></EditableCell>
  );
}
