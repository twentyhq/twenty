import { useRecoilState } from 'recoil';


import { DoubleTextChipDisplay } from '@/ui/content-display/components/DoubleTextChipDisplay';
import { ViewFieldDoubleTextChipMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCellDisplayMode = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const [firstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.secondValueFieldName,
    }),
  );

  const [avatarUrlValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.avatarUrlFieldName,
    }),
  );

  const displayName = [firstValue, secondValue].filter(Boolean).join(' ');

  return (
    <DoubleTextChipDisplay
      entityType={columnDefinition.metadata.entityType}
      displayName={displayName}
      entityId={currentRowEntityId}
      avatarUrlValue={avatarUrlValue}
    />
  );
};
