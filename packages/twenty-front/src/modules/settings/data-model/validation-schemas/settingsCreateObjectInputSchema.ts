import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
    shouldSyncLabelAndName: true,
    namePlural: true,
    nameSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular:
      value.nameSingular ??
      computeMetadataNameFromLabelOrThrow(value.labelSingular),
    namePlural:
      value.namePlural ??
      computeMetadataNameFromLabelOrThrow(value.labelPlural),
  }));
