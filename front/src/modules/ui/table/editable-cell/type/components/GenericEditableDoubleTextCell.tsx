import { useRecoilValue } from 'recoil';

import { TextDisplay } from '@/ui/content-display/components/TextDisplay';
import { FieldDoubleTextMetadata } from '@/ui/field/types/FieldMetadata';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

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
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const secondValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const displayName = `${firstValue ?? ''} ${secondValue ?? ''}`;

  return (
    <EditableCell
      editModeContent={
        <GenericEditableDoubleTextCellEditMode
          viewFieldDefinition={viewFieldDefinition}
        />
      }
      nonEditModeContent={<TextDisplay text={displayName} />}
    ></EditableCell>
  );
};
