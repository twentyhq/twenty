import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { UpdateObjectPayload } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

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
  .transform<UpdateObjectPayload>((value) => ({
    ...value,
    nameSingular: value.labelSingular
      ? computeMetadataNameFromLabelOrThrow(value.labelSingular)
      : undefined,
    namePlural: value.labelPlural
      ? computeMetadataNameFromLabelOrThrow(value.labelPlural)
      : undefined,
  }));
