import { useRecoilValue } from 'recoil';

import { DateDisplay } from '@/ui/field/meta-types/display/content-display/components/DateDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDateMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableDateCellEditMode } from './GenericEditableDateCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldDateMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

export const GenericEditableDateCell = ({
  viewFieldDefinition,
  editModeHorizontalAlign,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const fieldValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <TableCellContainer
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <GenericEditableDateCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<DateDisplay value={fieldValue} />}
    ></TableCellContainer>
  );
};
