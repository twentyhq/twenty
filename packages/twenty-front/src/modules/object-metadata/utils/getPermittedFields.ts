import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type GetPermittedFieldsArgs = {
  fields: FieldMetadataItem[];
  objectPermissions: Pick<ObjectRecordsPermissions, 'restrictedFields'>;
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
