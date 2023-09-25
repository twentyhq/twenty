import { useRecoilState } from 'recoil';

import { DoubleTextChipDisplay } from '@/ui/field/meta-types/display/content-display/components/DoubleTextChipDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDoubleTextChipMetadata } from '@/ui/field/types/FieldMetadata';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<FieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCellDisplayMode = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const [firstValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.secondValueFieldName,
    }),
  );

  const [avatarUrlValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
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
