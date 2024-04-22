import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { formatMetadataLabel } from '~/pages/settings/data-model/utils/format-metadata-label.util';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: formatMetadataLabel(value.labelSingular),
    namePlural: formatMetadataLabel(value.labelPlural),
  }));
