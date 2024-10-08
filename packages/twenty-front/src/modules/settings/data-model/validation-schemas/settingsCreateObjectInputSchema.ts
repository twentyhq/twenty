import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema.pick({
  description: true,
  icon: true,
  labelPlural: true,
  labelSingular: true,
  areLabelAndNameSync: true,
  namePlural: true,
  nameSingular: true,
});
