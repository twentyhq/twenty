import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

export const generateUpdateRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields: RestrictedFieldsPermissions | undefined,
  i18nContext: EffectiveEntityI18nContext,
) => {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
    i18nContext,
  );

  return recordPropertiesSchema.partial().extend({
    id: z.string().uuid({
      message:
        'The unique identifier (UUID) of the record to update. This is required to identify which record should be modified.',
    }),
  });
};
