import { useRecoilValue } from 'recoil';

import { DoubleTextDisplay } from '@/ui/field/meta-types/display/content-display/components/DoubleTextDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDoubleTextMetadata } from '@/ui/field/types/FieldMetadata';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';
import { TableCellContainer } from '../../components/TableCellContainer';

import { GenericEditableDoubleTextCellEditMode } from './GenericEditableDoubleTextCellEditMode';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldDoubleTextMetadata>;
};

export const GenericEditableDoubleTextCell = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const firstValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const secondValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const displayName = `${firstValue ?? ''} ${secondValue ?? ''}`;

  return (
    <TableCellContainer
      editModeContent={
        <GenericEditableDoubleTextCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<DoubleTextDisplay text={displayName} />}
    ></TableCellContainer>
  );
};
