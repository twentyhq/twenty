import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';

export const settingsUpdateObjectInputSchema =
  settingsDataModelObjectAboutFormSchema
    .merge(
      objectMetadataItemSchema.pick({
        imageIdentifierFieldMetadataId: true,
        isActive: true,
        labelIdentifierFieldMetadataId: true,
      }),
    )
    .partial();
