import { useRecoilValue } from 'recoil';

import { MoneyDisplay } from '@/ui/content-display/components/MoneyDisplay';
import { FieldMoneyMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableMoneyCellEditMode } from './GenericEditableMoneyCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldMoneyMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableMoneyCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<number>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableMoneyCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<MoneyDisplay value={fieldValue} />}
    ></EditableCell>
  );
};
