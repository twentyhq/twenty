import { EntityChip } from '@/ui/display/chip/components/EntityChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  if (!fieldValue || !fieldDefinition) {
    return <></>;
  }

  const mainIdentifierMapped =
    fieldDefinition.metadata.mainIdentifierMapper(fieldValue);

  return (
    <EntityChip
      entityId={fieldValue.id}
      name={mainIdentifierMapped.name}
      avatarUrl={mainIdentifierMapped.avatarUrl}
      avatarType={mainIdentifierMapped.avatarType}
    />
  );
};
