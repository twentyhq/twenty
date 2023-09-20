import { useRecoilValue } from 'recoil';

import { NumberDisplay } from '@/ui/content-display/components/NumberDisplay';
import { FieldNumberMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableNumberCellEditMode } from './GenericEditableNumberCellEditMode';

type OwnProps = {
  columnDefinition: ViewFieldDefinition<FieldNumberMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableNumberCell = ({
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
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableNumberCellEditMode
          viewFieldDefinition={columnDefinition}
        />
      }
      nonEditModeContent={<NumberDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
