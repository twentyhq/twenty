import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { type ObjectPermissions } from 'twenty-shared/types';

type GetPermittedFieldsArgs = {
  fields: FieldMetadataItem[];
  objectPermissions: Pick<ObjectPermissions, 'restrictedFields'>;
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
      readableFields.push(field);
    }

    if (canUpdateField) {
      updatableFields.push(field);
    }
  }

  return { readableFields, updatableFields };
};
