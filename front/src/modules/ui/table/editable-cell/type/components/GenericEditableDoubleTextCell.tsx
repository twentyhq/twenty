import { useRecoilValue } from 'recoil';

import { TextDisplay } from '@/ui/content-display/components/TextDisplay';
import { ViewFieldDoubleTextMetadata } from '@/ui/editable-field/types/ViewField';
import { EditableCell } from '@/ui/table/editable-cell/components/EditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

import { GenericEditableDoubleTextCellEditMode } from './GenericEditableDoubleTextCellEditMode';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextMetadata>;
};

export const GenericEditableDoubleTextCell = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const firstValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.firstValueFieldName,
    }),
  );

  const secondValue = useRecoilValue<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.secondValueFieldName,
    }),
  );

  const displayName = `${firstValue ?? ''} ${secondValue ?? ''}`;

  return (
    <EditableCell
      editModeContent={
        <GenericEditableDoubleTextCellEditMode
          columnDefinition={columnDefinition}
        />
      }
      nonEditModeContent={<TextDisplay text={displayName} />}
    ></EditableCell>
  );
};
