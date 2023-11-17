import { EntityChip } from '@/ui/display/chip/components/EntityChip';
import { getEntityChipFromFieldMetadata } from '@/ui/object/field/meta-types/display/utils/getEntityChipFromFieldMetadata';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  const entityChipProps = getEntityChipFromFieldMetadata(
    fieldDefinition,
    fieldValue,
  );

  return (
    <EntityChip
      entityId={entityChipProps.entityId}
      name={entityChipProps.name}
      pictureUrl={entityChipProps.pictureUrl}
      avatarType={entityChipProps.avatarType}
    />
  );
};
