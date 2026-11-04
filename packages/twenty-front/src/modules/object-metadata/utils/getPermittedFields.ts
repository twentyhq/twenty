import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { isDefined } from 'twenty-shared/utils';

type GetPermittedFieldsArgs = {
  fields: FieldMetadataItem[];
  objectPermissions: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'restrictedFields'
  >;
};

const getFieldWithPermittedMorphTargets = ({
  field,
  objectPermissions,
  permission,
}: {
  field: FieldMetadataItem;
  objectPermissions: GetPermittedFieldsArgs['objectPermissions'];
  permission: 'canReadField' | 'canUpdateField';
}): FieldMetadataItem => {
  if (!isDefined(field.morphRelations)) {
    return field;
  }

  const permittedMorphRelations = field.morphRelations.filter(
    (morphRelation) =>
      getFieldPermissions({
        objectPermissions,
        fieldMetadataId: morphRelation.sourceFieldMetadata.id,
      })[permission],
  );

  return permittedMorphRelations.length === field.morphRelations.length
    ? field
    : { ...field, morphRelations: permittedMorphRelations };
};

export const getPermittedFields = ({
  fields,
  objectPermissions,
}: GetPermittedFieldsArgs) => {
  const readableFields: FieldMetadataItem[] = [];
  const updatableFields: FieldMetadataItem[] = [];

  for (const field of fields) {
    const { canReadField, canUpdateField } = getFieldPermissions({
      objectPermissions,
      fieldMetadataId: field.id,
    });

    if (canReadField) {
      readableFields.push(
        getFieldWithPermittedMorphTargets({
          field,
          objectPermissions,
          permission: 'canReadField',
        }),
      );
    }

    if (canUpdateField) {
      updatableFields.push(
        getFieldWithPermittedMorphTargets({
          field,
          objectPermissions,
          permission: 'canUpdateField',
        }),
      );
    }
  }

  return { readableFields, updatableFields };
};
