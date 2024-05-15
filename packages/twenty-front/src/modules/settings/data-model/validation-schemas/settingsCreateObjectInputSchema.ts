import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: computeMetadataNameFromLabelOrThrow(value.labelSingular),
    namePlural: computeMetadataNameFromLabelOrThrow(value.labelPlural),
  }));
