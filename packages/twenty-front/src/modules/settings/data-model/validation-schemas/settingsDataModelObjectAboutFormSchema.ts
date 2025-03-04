import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { z } from 'zod';

const requiredFormFields = objectMetadataItemSchema.pick({
  description: true,
  icon: true,
  labelPlural: true,
  labelSingular: true,
});
const optionalFormFields = objectMetadataItemSchema
  .pick({
    nameSingular: true,
    namePlural: true,
    isLabelSyncedWithName: true,
  })
  .partial();
export const settingsDataModelObjectAboutFormSchema =
  requiredFormFields.merge(optionalFormFields);
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
