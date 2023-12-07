import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { EntityChip } from '@/ui/display/chip/components/EntityChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  const { identifiersMapper } = useRelationPicker();

  if (!fieldValue || !fieldDefinition || !identifiersMapper) {
    return <></>;
  }

  const objectIdentifiers = identifiersMapper(
    fieldValue,
    fieldDefinition.metadata.relationObjectMetadataNameSingular,
  );

  return (
    <EntityChip
      entityId={fieldValue.id}
      name={objectIdentifiers?.name ?? ''}
      avatarUrl={objectIdentifiers?.avatarUrl}
      avatarType={objectIdentifiers?.avatarType}
    />
  );
};
