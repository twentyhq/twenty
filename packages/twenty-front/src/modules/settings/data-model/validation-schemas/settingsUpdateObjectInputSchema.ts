import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { UpdateObjectInput } from '~/generated-metadata/graphql';
import { formatMetadataLabelToMetadataNameOrThrows } from '~/pages/settings/data-model/utils/format-metadata-label-to-name.util';

export const settingsUpdateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
  })
  .partial()
  .transform<UpdateObjectInput>((value) => ({
    ...value,
    nameSingular: value.labelSingular
      ? formatMetadataLabelToMetadataNameOrThrows(value.labelSingular)
      : undefined,
    namePlural: value.labelPlural
      ? formatMetadataLabelToMetadataNameOrThrows(value.labelPlural)
      : undefined,
  }));
