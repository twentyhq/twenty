import { useRecoilValue } from 'recoil';

import { TextDisplay } from '@/ui/field/meta-types/display/content-display/components/TextDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDoubleTextMetadata } from '@/ui/field/types/FieldMetadata';
import { TableCellContainer } from '@/ui/table/editable-cell/components/TableCellContainer';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { GenericEditableDoubleTextCellEditMode } from './GenericEditableDoubleTextCellEditMode';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldDoubleTextMetadata>;
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
      nonEditModeContent={<TextDisplay text={displayName} />}
    ></TableCellContainer>
  );
};
