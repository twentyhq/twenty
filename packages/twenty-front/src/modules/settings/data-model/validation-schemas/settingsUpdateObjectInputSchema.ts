import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

export const settingsUpdateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
    areLabelAndNameSync: true,
    namePlural: true,
    nameSingular: true,
  })
  .partial();
