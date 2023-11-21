import { EntityChip } from '@/ui/display/chip/components/EntityChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  const { mapToObjectIdentifiers } = useRelationField();

  if (!fieldValue || !fieldDefinition) {
    return <></>;
  }

  const objectIdentifiers = mapToObjectIdentifiers(fieldValue);

  return (
    <EntityChip
      entityId={fieldValue.id}
      name={objectIdentifiers.name}
      avatarUrl={objectIdentifiers.avatarUrl}
      avatarType={objectIdentifiers.avatarType}
    />
  );
};
