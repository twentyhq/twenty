import { useRecoilValue } from 'recoil';

import { DateDisplay } from '@/ui/content-display/components/DateDisplay';
import { FieldDateMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableDateCellEditMode } from './GenericEditableDateCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableDateCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableDateCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<DateDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
