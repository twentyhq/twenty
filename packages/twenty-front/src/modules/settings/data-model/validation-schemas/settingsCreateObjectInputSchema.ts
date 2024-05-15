import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';
import { METADATA_NAME_VALID_STRING_PATTERN } from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: formatLabelOrThrows(
      value.labelSingular,
      METADATA_NAME_VALID_STRING_PATTERN,
    ),
    namePlural: formatLabelOrThrows(
      value.labelPlural,
      METADATA_NAME_VALID_STRING_PATTERN,
    ),
  }));
