import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { formatString } from '~/pages/settings/data-model/utils/format-string.util';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: formatString(value.labelSingular),
    namePlural: formatString(value.labelPlural),
  }));
