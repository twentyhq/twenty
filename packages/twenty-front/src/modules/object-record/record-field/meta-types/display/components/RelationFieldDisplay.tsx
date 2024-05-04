import { EntityChip } from 'twenty-ui';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition, maxWidth, entityId } =
    useRelationField();

  if (!fieldValue || !fieldDefinition) return null;

  return (
    <EntityChip
      entityId={entityId}
      name={fieldValue.name}
      avatarType={fieldValue.avatarType}
      avatarUrl={fieldValue.avatarUrl}
      linkToEntity={fieldValue.linkToShowPage}
      maxWidth={maxWidth}
    />
  );
};
