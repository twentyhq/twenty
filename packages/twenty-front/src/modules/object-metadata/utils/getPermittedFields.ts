import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type GetPermittedFieldsArgs = {
  fields: FieldMetadataItem[];
  objectPermissions: Pick<ObjectPermissions, 'restrictedFields'>;
};

type FieldPermission = 'canReadField' | 'canUpdateField';

// A head restriction covers every morph target, a target restriction only its own column.
const getPermittedField = ({
  field,
  objectPermissions,
  permission,
}: {
  field: FieldMetadataItem;
  objectPermissions: GetPermittedFieldsArgs['objectPermissions'];
  permission: FieldPermission;
}): FieldMetadataItem | undefined => {
  const isFieldPermitted = getFieldPermissions({
    objectPermissions,
    fieldMetadataId: field.id,
  })[permission];

  if (!isFieldPermitted) {
    return undefined;
  }

  if (!isNonEmptyArray(field.morphRelations)) {
    return field;
  }

  const permittedMorphRelations = field.morphRelations.filter(
    (morphRelation) =>
      getFieldPermissions({
        objectPermissions,
        fieldMetadataId: morphRelation.sourceFieldMetadata.id,
      })[permission],
  );

  if (permittedMorphRelations.length === field.morphRelations.length) {
    return field;
  }

  return isNonEmptyArray(permittedMorphRelations)
    ? { ...field, morphRelations: permittedMorphRelations }
    : undefined;
};

export const getPermittedFields = ({
  fields,
  objectPermissions,
}: GetPermittedFieldsArgs) => {
  const readableFields: FieldMetadataItem[] = [];
  const updatableFields: FieldMetadataItem[] = [];

  for (const field of fields) {
    const readableField = getPermittedField({
      field,
      objectPermissions,
      permission: 'canReadField',
    });
    const updatableField = getPermittedField({
      field,
      objectPermissions,
      permission: 'canUpdateField',
    });

    if (isDefined(readableField)) {
      readableFields.push(readableField);
    }

    if (isDefined(updatableField)) {
      updatableFields.push(updatableField);
    }
  }

  return { readableFields, updatableFields };
};
