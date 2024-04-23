import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { formatMetadataLabelToMetadataNameOrThrows } from '~/pages/settings/data-model/utils/format-metadata-label-to-name.util';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: formatMetadataLabelToMetadataNameOrThrows(
      value.labelSingular,
    ),
    namePlural: formatMetadataLabelToMetadataNameOrThrows(value.labelPlural),
  }));
