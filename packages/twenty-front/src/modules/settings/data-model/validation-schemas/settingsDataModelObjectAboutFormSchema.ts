import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { z } from 'zod';

const requiredFormFields = objectMetadataItemSchema.pick({
  description: true, // what happens if empty string ?
  icon: true,
});

// Can ApiNames contains whitespace ?
const zodNonEmptyString = z.string().min(1);
const optionalFormFields = z.object({
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
  namePlural: zodNonEmptyString.optional(),
  nameSingular: zodNonEmptyString.optional(),
  isLabelSyncedWithName: z.boolean().optional(),
});
export const settingsDataModelObjectAboutFormSchema =
  requiredFormFields.merge(optionalFormFields);
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
