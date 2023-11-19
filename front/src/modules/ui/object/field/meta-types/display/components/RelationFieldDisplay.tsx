import { EntityChip } from '@/ui/display/chip/components/EntityChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  if (!fieldValue || !fieldDefinition.mainIdentifierMapper) {
    return <></>;
  }

  const mainIdentifierMapped = fieldDefinition.mainIdentifierMapper(fieldValue);

  return (
    <EntityChip
      entityId={fieldValue.id}
      name={mainIdentifierMapped.name}
      pictureUrl={mainIdentifierMapped.pictureUrl}
      avatarType={mainIdentifierMapped.avatarType}
    />
  );
};
