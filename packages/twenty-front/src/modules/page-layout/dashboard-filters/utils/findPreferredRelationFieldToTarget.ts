import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { PREFERRED_OWNER_FIELD_NAMES } from '@/page-layout/dashboard-filters/constants/PreferredOwnerFieldNames';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

// A field named after its target (company -> Company) is the canonical link; owner-like names come next.
export const findPreferredRelationFieldToTarget = ({
  fields,
  targetObjectMetadataId,
}: {
  fields: FieldMetadataItem[];
  targetObjectMetadataId: string;
}): FieldMetadataItem | undefined => {
  const candidateFields = fields.filter(
    (field) =>
      field.isActive === true &&
      isManyToOneRelationField(field) &&
      field.relation.targetObjectMetadata.id === targetObjectMetadataId,
  );

  const targetObjectNameSingular =
    candidateFields[0]?.relation?.targetObjectMetadata.nameSingular;

  const preferredFieldNames = [
    targetObjectNameSingular,
    ...PREFERRED_OWNER_FIELD_NAMES,
  ].filter(isDefined);

  const preferredField = preferredFieldNames
    .map((preferredFieldName) =>
      candidateFields.find((field) => field.name === preferredFieldName),
    )
    .find(isDefined);

  // Metadata field order is not stable across workspaces, so ties fall back to the name order.
  return preferredField ?? [...candidateFields].sort(sortByProperty('name'))[0];
};
