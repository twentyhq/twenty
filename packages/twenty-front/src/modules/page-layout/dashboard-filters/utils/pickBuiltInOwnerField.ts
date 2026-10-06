import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Standard objects name their owner field one of these; a custom object falls back to its first one alphabetically.
const PREFERRED_OWNER_FIELD_NAMES = ['accountOwner', 'assignee'];

const isWorkspaceMemberManyToOneField = (field: FieldMetadataItem) =>
  field.isActive &&
  field.relation?.type === RelationType.MANY_TO_ONE &&
  field.relation.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

// Field order from the API is not stable, so ties are broken by name to keep the binding deterministic.
export const pickBuiltInOwnerField = (fields: FieldMetadataItem[]) => {
  const candidateFields = fields
    .filter(isWorkspaceMemberManyToOneField)
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));

  return (
    PREFERRED_OWNER_FIELD_NAMES.map((preferredFieldName) =>
      candidateFields.find((field) => field.name === preferredFieldName),
    ).find(isDefined) ?? candidateFields[0]
  );
};
