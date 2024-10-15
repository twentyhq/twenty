import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { UpdateObjectPayload } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { isDefined } from '~/utils/isDefined';

export const settingsUpdateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
    shouldSyncLabelAndName: true,
    namePlural: true,
    nameSingular: true,
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
    shouldSyncLabelAndName: isDefined(value.shouldSyncLabelAndName)
      ? value.shouldSyncLabelAndName
      : true,
  }));
