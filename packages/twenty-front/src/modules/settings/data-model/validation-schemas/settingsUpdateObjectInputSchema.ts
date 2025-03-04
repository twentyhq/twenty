import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';

// TODO double check
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
