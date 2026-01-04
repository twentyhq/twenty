import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';

export const generateCreateRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  return generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  );
};
