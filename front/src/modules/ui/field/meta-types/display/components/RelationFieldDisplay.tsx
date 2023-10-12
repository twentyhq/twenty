import { EntityChip } from '@/ui/chip/components/EntityChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();
  const { entityChipDisplayMapper } = fieldDefinition;
  if (!entityChipDisplayMapper) {
    throw new Error(
      "Missing entityChipDisplayMapper in FieldContext. Please provide it in the FieldContextProvider's value prop.",
    );
  }
  const { name, pictureUrl, avatarType } =
    entityChipDisplayMapper?.(fieldValue);

  return (
    <EntityChip
      entityId={fieldValue?.id}
      name={name}
      pictureUrl={pictureUrl}
      avatarType={avatarType}
    />
  );
};
