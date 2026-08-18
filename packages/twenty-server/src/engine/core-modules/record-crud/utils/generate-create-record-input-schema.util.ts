import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

export const generateCreateRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
  i18nContext?: EffectiveEntityI18nContext,
) => {
  return generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
    i18nContext,
  );
};
