import { useRecoilValue } from 'recoil';

import { MoneyDisplay } from '@/ui/field/meta-types/display/content-display/components/MoneyDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldMoneyMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableMoneyCellEditMode } from './GenericEditableMoneyCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldMoneyMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableMoneyCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<number>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <TableCellContainer
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableMoneyCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<MoneyDisplay value={fieldValue} />}
    ></TableCellContainer>
  );
};
